import { prisma } from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";
import { BOOKING_START_TIMES, addMinutesToTime } from "@/src/lib/booking-time";
import {
  getTodayDateString,
  isValidDateString,
  toPrismaDate,
} from "@/src/lib/date";
import { DAILY_GROUP_LIMIT } from "@/src/lib/booking-capacity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const serviceId = searchParams.get("serviceId")?.trim() ?? "";
    const date = searchParams.get("date")?.trim() ?? "";

    if (!serviceId) {
      return errorResponse("請選擇服務。", 400);
    }

    if (!date || !isValidDateString(date)) {
      return errorResponse("日期格式不正確。", 400);
    }

    if (date < getTodayDateString()) {
      return errorResponse("日期不可早於今天。", 400);
    }

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service || !service.isActive) {
      return errorResponse("此服務目前無法預約。", 400);
    }

    const prismaBookingDate = toPrismaDate(date);

    const activeBookings = await prisma.booking.findMany({
      where: {
        bookingDate: prismaBookingDate,
        status: {
          not: "cancelled",
        },
      },
      select: {
        startTime: true,
      },
    });

    const bookedGroupCount = activeBookings.length;
    const isFullyBooked = bookedGroupCount >= DAILY_GROUP_LIMIT;
    const bookedStartTimes = new Set(
      activeBookings.map((booking) => booking.startTime),
    );

    const slots = BOOKING_START_TIMES.map((startTime) => {
      const isBooked = bookedStartTimes.has(startTime);
      const isAvailable = !isFullyBooked && !isBooked;

      return {
        startTime,
        endTime: addMinutesToTime(startTime, service.durationMinutes),
        isBooked,
        isAvailable,
        reason: isAvailable
          ? null
          : isFullyBooked
            ? "當日額滿"
            : "已預約",
      };
    });

    return successResponse({
      date,
      dailyGroupLimit: DAILY_GROUP_LIMIT,
      bookedGroupCount,
      isFullyBooked,
      slots,
    });
  } catch (error) {
    console.error(error);

    return errorResponse("取得可預約時段失敗，請稍後再試。", 500);
  }
}