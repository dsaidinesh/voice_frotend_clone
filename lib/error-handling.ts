// Types for our error handling system
export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

// Error messages mapped to HTTP status codes
export const ERROR_MESSAGES: Record<number, string> = {
  // Client Errors (4xx)
  400: "The request was invalid. Please check your input and try again.",
  401: "You need to be logged in to access this resource.",
  403: "You don't have permission to access this resource.",
  404: "The requested resource was not found.",
  409: "This operation couldn't be completed due to a conflict with existing data.",
  422: "The provided data is invalid. Please check your input and try again.",
  429: "Too many requests. Please try again later.",
  
  // Server Errors (5xx)
  500: "An unexpected error occurred on our servers. Please try again later.",
  502: "We're having trouble connecting to our servers. Please try again later.",
  503: "Our service is temporarily unavailable. Please try again later.",
  504: "The server took too long to respond. Please try again later."
};

// Helper function to get a user-friendly error message
export function getErrorMessage(error: any): string {
  // If it's an API error with a status code
  if (error?.status && ERROR_MESSAGES[error.status]) {
    return ERROR_MESSAGES[error.status];
  }

  // If it's a network error
  if (!navigator.onLine) {
    return "Please check your internet connection and try again.";
  }

  // Default error message
  return "Something went wrong. Please try again later.";
}

// Custom error class for API errors
export class ApiErrorHandler extends Error {
  status: number;
  details?: any;

  constructor(status: number, message?: string, details?: any) {
    super(message || ERROR_MESSAGES[status] || "An error occurred");
    this.status = status;
    this.details = details;
    this.name = "ApiError";
  }
}

// Helper function to handle API responses
export async function handleApiResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiErrorHandler(
      response.status,
      errorData.message || ERROR_MESSAGES[response.status],
      errorData.details
    );
  }
  return response.json();
} 