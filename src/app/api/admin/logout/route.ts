import { NextResponse } from "next/server";
import { clearAdminSession } from "@/src/lib/auth";
import { successResponse } from "@/src/lib/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await clearAdminSession();

  return NextResponse.json(successResponse(null, "已登出。"));
}