import { useState } from 'react';
import { handleApiResponse, getErrorMessage } from '@/lib/error-handling';
import { toast } from 'sonner'; // Assuming you're using sonner for toasts

interface UseApiOptions {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeRequest = async <T>(
    requestFn: () => Promise<Response>,
    options: UseApiOptions = {}
  ): Promise<T | null> => {
    const {
      showErrorToast = true,
      showSuccessToast = false,
      successMessage = 'Operation completed successfully'
    } = options;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await requestFn();
      const data = await handleApiResponse(response);
      
      if (showSuccessToast) {
        toast.success(successMessage);
      }
      
      return data;
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    executeRequest
  };
} 