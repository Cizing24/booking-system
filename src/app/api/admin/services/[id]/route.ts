import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UpdateServiceBody = {
  name?: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
  isActive?: boolean;
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const adminUser = await getCurrentAdminUser();

    if (!adminUser) {
      return NextResponse.json(errorResponse("請先登入管理員帳號。"), {
        status: 401,
      });
    }

    const { id } = await context.params;
    const body = (await request.json()) as UpdateServiceBody;

    if (!id) {
      return NextResponse.json(errorResponse("缺少服務 ID。"), {
        status: 400,
      });
    }

    const existingService = await prisma.service.findUnique({
      where: {
        id,
      },
    });

    if (!existingService) {
      return NextResponse.json(errorResponse("找不到此服務。"), {
        status: 404,
      });
    }

    const updateData: {
      name?: string;
      description?: string;
      durationMinutes?: number;
      price?: number;
      isActive?: boolean;
    } = {};

    if (typeof body.name === "string") {
      const name = body.name.trim();

      if (!name) {
        return NextResponse.json(errorResponse("請輸入服務名稱。"), {
          status: 400,
        });
      }

      updateData.name = name;
    }

    if (typeof body.description === "string") {
      const description = body.description.trim();

      if (!description) {
        return NextResponse.json(errorResponse("請輸入服務說明。"), {
          status: 400,
        });
      }

      updateData.description = description;
    }

    if ("durationMinutes" in body) {
      const durationMinutes = Number(body.durationMinutes);

      if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
        return NextResponse.json(
          errorResponse("服務時長必須是大於 0 的整數。"),
          { status: 400 },
        );
      }

      updateData.durationMinutes = durationMinutes;
    }

    if ("price" in body) {
      const price = Number(body.price);

      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          errorResponse("價格必須是 0 或大於 0 的數字。"),
          { status: 400 },
        );
      }

      updateData.price = price;
    }

    if ("isActive" in body) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(errorResponse("服務狀態不正確。"), {
          status: 400,
        });
      }

      updateData.isActive = body.isActive;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(errorResponse("沒有可更新的資料。"), {
        status: 400,
      });
    }

    const updatedService = await prisma.service.update({
      where: {
        id,
      },
      data: updateData,
    });

    return NextResponse.json(
      successResponse(
        {
          id: updatedService.id,
          name: updatedService.name,
          description: updatedService.description,
          durationMinutes: updatedService.durationMinutes,
          price: Number(updatedService.price.toString()),
          isActive: updatedService.isActive,
        },
        "服務已更新。",
      ),
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(errorResponse("更新服務失敗，請稍後再試。"), {
      status: 500,
    });
  }
}