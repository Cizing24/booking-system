export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiError = {
  success: false;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function successResponse<T>(
  data: T,
  message?: string,
): ApiSuccess<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function errorResponse(error: string): ApiError {
  return {
    success: false,
    error,
  };
}