import { useState, useCallback } from 'react';
import axios from 'axios';
import { api, unwrapApiData } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { PresignResponse, FileContext } from '@/lib/api/types';
import { toast } from '@/components/ui/toast';

interface UseFileUploadOptions {
  context: FileContext;
  contextId: string;
  onSuccess?: (key: string) => void;
}

export function useFileUpload({ context, contextId, onSuccess }: UseFileUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      setProgress(0);

      try {
        const presignRes = await api.post(endpoints.files.presign, {
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          context,
          contextId,
        });

        const { uploadUrl, key, confirmToken } = unwrapApiData<PresignResponse>(presignRes.data);

        await axios.put(uploadUrl, file, {
          headers: { 'Content-Type': file.type },
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
          },
        });

        await api.post(endpoints.files.confirm, { key, confirmToken });

        toast.success('File uploaded successfully');
        onSuccess?.(key);
      } catch {
        toast.error('File upload failed');
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [context, contextId, onSuccess],
  );

  return { upload, uploading, progress };
}
