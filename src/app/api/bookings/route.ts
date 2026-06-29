import { NextRequest } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { successResponse, errorResponse } from "@/src/lib/response";
import { BOOKING_START_TIMES, addMinutesToTime } from "@/src/lib/booking-time";
import {
  getTodayDateString,
  isValidDateString,
  toPrismaDate,
  formatDateString,
} from "@/src/lib/date";
import {
  DAILY_GROUP_LIMIT,
  MAX_PARTY_SIZE,
  MIN_PARTY_SIZE,
  isValidPartySize,
} from "@/src/lib/booking-capacity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreateBookingRequestBody = {
  serviceId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  partySize?: number | string;
  bookingDate?: string;
  startTime?: string;
  note?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateBookingRequestBody;

    const serviceId = body.serviceId?.trim();
    const customerName = body.customerName?.trim();
    const customerPhone = body.customerPhone?.trim();
    const customerEmail = body.customerEmail?.trim();
    const bookingDate = body.bookingDate?.trim();
    const startTime = body.startTime?.trim();
    const note = body.note?.trim() || null;

    const partySize = body.partySize === undefined || body.partySize === ""
      ? 1
      : Number(body.partySize);

    if (!serviceId) {
      return errorResponse("請選擇服務。", 400);
    }

    if (!customerName) {
      return errorResponse("請填寫姓名。", 400);
    }

    if (!customerPhone) {
      return errorResponse("請填寫電話。", 400);
    }

    if (!customerEmail) {
      return errorResponse("請填寫 Email。", 400);
    }

    if (!isValidEmail(customerEmail)) {
      return errorResponse("Email 格式不正確。", 400);
    }

    if (!bookingDate || !isValidDateString(bookingDate)) {
      return errorResponse("預約日期格式不正確。", 400);
    }

    if (bookingDate < getTodayDateString()) {
      return errorResponse("預約日期不可早於今天。", 400);
    }

    if (!startTime || !BOOKING_START_TIMES.includes(startTime)) {
      return errorResponse("請選擇有效的預約時段。", 400);
    }

    if (!isValidPartySize(partySize)) {
      return errorResponse(
        `每組人數需為 ${MIN_PARTY_SIZE}～${MAX_PARTY_SIZE} 人。`,
        400,
      );
    }

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service || !service.isActive) {
      return errorResponse("此服務目前無法預約。", 400);
    }

    const prismaBookingDate = toPrismaDate(bookingDate);
    const endTime = addMinutesToTime(startTime, service.durationMinutes);

    const dailyBookingCount = await prisma.booking.count({
      where: {
        bookingDate: prismaBookingDate,
        status: {
          not: "cancelled",
        },
      },
    });

    if (dailyBookingCount >= DAILY_GROUP_LIMIT) {
      return errorResponse(
        `此日期已達每日 ${DAILY_GROUP_LIMIT} 組預約上限，請選擇其他日期。`,
        400,
      );
    }

    const existingTimeSlotBooking = await prisma.booking.findFirst({
      where: {
        bookingDate: prismaBookingDate,
        startTime,
        status: {
          not: "cancelled",
        },
      },
    });

    if (existingTimeSlotBooking) {
      return errorResponse("這個時段已被預約，請選擇其他時段。", 400);
    }

    const booking = await prisma.booking.create({
      data: {
        serviceId,
        customerName,
        customerPhone,
        customerEmail,
        partySize,
        bookingDate: prismaBookingDate,
        startTime,
        endTime,
        note,
        status: "pending",
      },
      include: {
        service: true,
      },
    });

    return successResponse(
      {
        booking: {
          id: booking.id,
          serviceName: booking.service.name,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          customerEmail: booking.customerEmail,
          partySize: booking.partySize,
          bookingDate: formatDateString(booking.bookingDate),
          startTime: booking.startTime,
          endTime: booking.endTime,
          note: booking.note,
          status: booking.status,
        },
        bookingId: booking.id,
      },
      201,
    );
  } catch (error) {
    console.error(error);

    return errorResponse("建立預約失敗，請稍後再試。", 500);
  }
}