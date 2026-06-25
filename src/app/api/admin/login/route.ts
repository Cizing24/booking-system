import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { setAdminSession } from "@/src/lib/auth";
import { verifyPassword } from "@/src/lib/password";
import { errorResponse, successResponse } from "@/src/lib/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LoginBody = {
  email?: string;
  password?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;

    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!email) {
      return NextResponse.json(errorResponse("請輸入 Email。"), {
        status: 400,
      });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(errorResponse("Email 格式不正確。"), {
        status: 400,
      });
    }

    if (!password) {
      return NextResponse.json(errorResponse("請輸入密碼。"), {
        status: 400,
      });
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: {
        email,
      },
    });

    if (!adminUser) {
      return NextResponse.json(errorResponse("帳號或密碼錯誤。"), {
        status: 401,
      });
    }

    const isPasswordValid = await verifyPassword(
      password,
      adminUser.passwordHash,
    );

    if (!isPasswordValid) {
      return NextResponse.json(errorResponse("帳號或密碼錯誤。"), {
        status: 401,
      });
    }

    await setAdminSession(adminUser.id);

    return NextResponse.json(
      successResponse(
        {
          id: adminUser.id,
          email: adminUser.email,
        },
        "登入成功。",
      ),
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(errorResponse("登入失敗，請稍後再試。"), {
      status: 500,
    });
  }
}