'use client';

import { useApi } from '@/app/hooks/useApi';
import { Button } from '@/components/ui/button';

export function ExampleComponent() {
  const { isLoading, error, executeRequest } = useApi();

  const handleFetchData = async () => {
    const data = await executeRequest(
      () => fetch('/api/some-endpoint'),
      {
        showErrorToast: true,
        showSuccessToast: true,
        successMessage: 'Data fetched successfully!'
      }
    );

    if (data) {
      // Handle successful response
      console.log('Data:', data);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleFetchData}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Fetch Data'}
      </Button>

      {error && (
        <div className="text-red-500">
          {error}
        </div>
      )}
    </div>
  );
} 