import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UpdateBookingStatusBody = {
  status?: string;
};

const allowedStatuses = ["pending", "confirmed", "cancelled"] as const;

type BookingStatus = (typeof allowedStatuses)[number];

function isBookingStatus(value: string): value is BookingStatus {
  return allowedStatuses.includes(value as BookingStatus);
}

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
    const body = (await request.json()) as UpdateBookingStatusBody;
    const status = body.status?.trim() ?? "";

    if (!id) {
      return NextResponse.json(errorResponse("缺少預約 ID。"), {
        status: 400,
      });
    }

    if (!status) {
      return NextResponse.json(errorResponse("請選擇預約狀態。"), {
        status: 400,
      });
    }

    if (!isBookingStatus(status)) {
      return NextResponse.json(errorResponse("預約狀態不正確。"), {
        status: 400,
      });
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id,
      },
    });

    if (!booking) {
      return NextResponse.json(errorResponse("找不到此預約。"), {
        status: 404,
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id,
      },
      data: {
        status,
      },
      include: {
        service: true,
      },
    });

    return NextResponse.json(
      successResponse(
        {
          id: updatedBooking.id,
          status: updatedBooking.status,
          serviceName: updatedBooking.service.name,
        },
        "預約狀態已更新。",
      ),
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(errorResponse("更新預約狀態失敗，請稍後再試。"), {
      status: 500,
    });
  }
}