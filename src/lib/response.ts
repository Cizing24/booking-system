import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiError = {
  success: false;
  message: string;
};

export function successResponse<T>(
  data: T,
  messageOrStatus?: string | number,
  status = 200,
): NextResponse<ApiSuccess<T>> {
  const message =
    typeof messageOrStatus === "string" ? messageOrStatus : undefined;

  const responseStatus =
    typeof messageOrStatus === "number" ? messageOrStatus : status;

  return NextResponse.json(
    {
      success: true,
      data,
      ...(message ? { message } : {}),
    },
    {
      status: responseStatus,
    },
  );
}

export function errorResponse(
  message: string,
  status = 400,
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
    },
  );
}