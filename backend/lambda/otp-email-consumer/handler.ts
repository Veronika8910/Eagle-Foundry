import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

interface SqsRecord {
  messageId: string;
  body: string;
}

interface SqsEvent {
  Records: SqsRecord[];
}

interface SqsBatchResponse {
  batchItemFailures: Array<{ itemIdentifier: string }>;
}

interface EventEnvelope<T = unknown> {
  eventId: string;
  type: string;
  occurredAt: string;
  payload: T;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

interface OtpPayload {
  email: string;
  otp: string;
  purpose: 'signup' | 'password_reset';
  expiresAt: string;
}

const EVENT_TYPES = new Set([
  'email.otp_requested',
  'email.password_reset_otp_requested',
]);

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL || '';

const ses = new SESClient({ region: AWS_REGION });

function isOtpPayload(value: unknown): value is OtpPayload {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.email === 'string' &&
    typeof payload.otp === 'string' &&
    /^\d{6}$/.test(payload.otp) &&
    (payload.purpose === 'signup' || payload.purpose === 'password_reset') &&
    typeof payload.expiresAt === 'string'
  );
}

function buildOtpEmail(payload: OtpPayload): {
  subject: string;
  htmlBody: string;
  textBody: string;
} {
  const isSignup = payload.purpose === 'signup';
  const subject = isSignup
    ? 'Verify your Eagle Foundry account'
    : 'Reset your Eagle Foundry password';

  const actionText = isSignup
    ? 'verify your email address'
    : 'reset your password';

  const htmlBody = `
  <!DOCTYPE html>
  <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="margin: 0 0 12px; font-size: 22px;">Eagle Foundry</h1>
      <p style="margin: 0 0 12px;">Use this code to ${actionText}:</p>
      <div style="margin: 0 0 16px; padding: 14px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center;">
        <span style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${payload.otp}</span>
      </div>
      <p style="margin: 0; color: #6b7280; font-size: 13px;">
        This code expires at ${new Date(payload.expiresAt).toUTCString()}.
        If you did not request this, you can ignore this email.
      </p>
    </body>
  </html>
  `;

  const textBody = `Eagle Foundry

Your verification code: ${payload.otp}

Use this code to ${actionText}.
Code expires at: ${new Date(payload.expiresAt).toUTCString()}

If you did not request this, you can ignore this email.`;

  return { subject, htmlBody, textBody };
}

async function sendOtpEmail(payload: OtpPayload): Promise<void> {
  if (!SES_FROM_EMAIL) {
    throw new Error('SES_FROM_EMAIL environment variable is required');
  }

  const email = buildOtpEmail(payload);
  const command = new SendEmailCommand({
    Source: SES_FROM_EMAIL,
    Destination: { ToAddresses: [payload.email] },
    Message: {
      Subject: { Data: email.subject, Charset: 'UTF-8' },
      Body: {
        Html: { Data: email.htmlBody, Charset: 'UTF-8' },
        Text: { Data: email.textBody, Charset: 'UTF-8' },
      },
    },
  });

  await ses.send(command);
}

export async function handler(event: SqsEvent): Promise<SqsBatchResponse> {
  const batchItemFailures: Array<{ itemIdentifier: string }> = [];
  const processedInBatch = new Set<string>();

  for (const record of event.Records || []) {
    try {
      const parsed = JSON.parse(record.body) as EventEnvelope;
      if (!parsed || typeof parsed !== 'object') {
        console.warn('Skipping malformed envelope', { messageId: record.messageId });
        continue;
      }

      if (typeof parsed.eventId === 'string' && processedInBatch.has(parsed.eventId)) {
        console.info('Skipping duplicate event in same batch', {
          eventId: parsed.eventId,
          messageId: record.messageId,
        });
        continue;
      }

      if (!EVENT_TYPES.has(parsed.type)) {
        console.info('Skipping unsupported event type', {
          type: parsed.type,
          messageId: record.messageId,
        });
        continue;
      }

      if (!isOtpPayload(parsed.payload)) {
        console.warn('Skipping invalid OTP payload', {
          eventId: parsed.eventId,
          type: parsed.type,
          messageId: record.messageId,
        });
        continue;
      }

      await sendOtpEmail(parsed.payload);

      if (typeof parsed.eventId === 'string') {
        processedInBatch.add(parsed.eventId);
      }

      console.info('OTP email sent', {
        eventId: parsed.eventId,
        type: parsed.type,
        messageId: record.messageId,
        email: maskEmail(parsed.payload.email),
      });
    } catch (error) {
      console.error('Failed to process SQS record', {
        messageId: record.messageId,
        error: error instanceof Error ? error.message : String(error),
      });
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
}
