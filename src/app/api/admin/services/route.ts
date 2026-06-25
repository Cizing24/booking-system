import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreateServiceBody = {
  name?: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
  isActive?: boolean;
};

export async function POST(request: Request) {
  try {
    const adminUser = await getCurrentAdminUser();

    if (!adminUser) {
      return NextResponse.json(errorResponse("請先登入管理員帳號。"), {
        status: 401,
      });
    }

    const body = (await request.json()) as CreateServiceBody;

    const name = body.name?.trim() ?? "";
    const description = body.description?.trim() ?? "";
    const durationMinutes = Number(body.durationMinutes);
    const price = Number(body.price);
    const isActive = Boolean(body.isActive);

    if (!name) {
      return NextResponse.json(errorResponse("請輸入服務名稱。"), {
        status: 400,
      });
    }

    if (!description) {
      return NextResponse.json(errorResponse("請輸入服務說明。"), {
        status: 400,
      });
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
      return NextResponse.json(errorResponse("服務時長必須是大於 0 的整數。"), {
        status: 400,
      });
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(errorResponse("價格必須是 0 或大於 0 的數字。"), {
        status: 400,
      });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        durationMinutes,
        price,
        isActive,
      },
    });

    return NextResponse.json(
      successResponse(
        {
          id: service.id,
          name: service.name,
          description: service.description,
          durationMinutes: service.durationMinutes,
          price: Number(service.price.toString()),
          isActive: service.isActive,
        },
        "服務已新增。",
      ),
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(errorResponse("新增服務失敗，請稍後再試。"), {
      status: 500,
    });
  }
}