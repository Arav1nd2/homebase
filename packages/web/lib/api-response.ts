import { NextResponse } from "next/server";

/** Shared Route Handler error shape (constitution Principle V). */
export function errorResponse(
  status: number,
  code: string,
  message: string,
): NextResponse {
  return NextResponse.json({ error: { message, code } }, { status });
}
