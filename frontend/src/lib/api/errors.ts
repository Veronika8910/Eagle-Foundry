import type { AxiosError } from 'axios';

export interface ApiErrorBody {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
  details?: unknown;
  statusCode?: number;
}

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }

  get isValidation(): boolean {
    return this.status === 400 || this.status === 422;
  }

  get fieldErrors(): Record<string, string[]> {
    return this.body.errors ?? {};
  }
}

export function parseApiError(error: unknown): ApiError {
  if (error == null || typeof error !== 'object') {
    return new ApiError(0, { message: String(error ?? 'Unknown error') });
  }

  const axiosErr = error as AxiosError<ApiErrorBody>;

  if (axiosErr.response) {
    const { status, data } = axiosErr.response;
    const backendEnvelope = data as {
      success?: boolean;
      error?: {
        code?: string;
        message?: string;
        details?: unknown;
      };
      message?: string;
      errors?: Record<string, string[]>;
    };

    const details = backendEnvelope?.error?.details;
    const fieldErrors: Record<string, string[]> = { ...(backendEnvelope?.errors ?? {}) };

    if (Array.isArray(details)) {
      for (const item of details) {
        if (
          item &&
          typeof item === 'object' &&
          'field' in item &&
          'message' in item &&
          typeof (item as { field?: unknown }).field === 'string' &&
          typeof (item as { message?: unknown }).message === 'string'
        ) {
          const field = (item as { field: string }).field;
          const message = (item as { message: string }).message;
          fieldErrors[field] = [...(fieldErrors[field] ?? []), message];
        }
      }
    }

    return new ApiError(status, {
      message:
        backendEnvelope?.error?.message ??
        backendEnvelope?.message ??
        data?.message ??
        'An unexpected error occurred',
      code: backendEnvelope?.error?.code,
      errors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      details: backendEnvelope?.error?.details,
      statusCode: status,
    });
  }

  if (axiosErr.request) {
    return new ApiError(0, { message: 'Network error — please check your connection' });
  }

  return new ApiError(0, { message: String(error) });
}
