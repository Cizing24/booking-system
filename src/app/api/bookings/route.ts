import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";
import { BOOKING_START_TIMES, addMinutesToTime } from "@/src/lib/booking-time";
import {
  getTodayDateString,
  isValidDateString,
  toPrismaDate,
} from "@/src/lib/date";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreateBookingBody = {
  serviceId?: string;
  bookingDate?: string;
  startTime?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  note?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateBookingBody;

    const serviceId = body.serviceId?.trim() ?? "";
    const bookingDate = body.bookingDate?.trim() ?? "";
    const startTime = body.startTime?.trim() ?? "";
    const customerName = body.customerName?.trim() ?? "";
    const customerPhone = body.customerPhone?.trim() ?? "";
    const customerEmail = body.customerEmail?.trim() ?? "";
    const note = body.note?.trim() || null;

    if (!serviceId) {
      return NextResponse.json(errorResponse("請選擇服務。"), { status: 400 });
    }

    if (!bookingDate) {
      return NextResponse.json(errorResponse("請選擇預約日期。"), {
        status: 400,
      });
    }

    if (!isValidDateString(bookingDate)) {
      return NextResponse.json(errorResponse("預約日期格式不正確。"), {
        status: 400,
      });
    }

    const today = getTodayDateString();

    if (bookingDate < today) {
      return NextResponse.json(errorResponse("預約日期不可早於今天。"), {
        status: 400,
      });
    }

    if (!startTime) {
      return NextResponse.json(errorResponse("請選擇預約時段。"), {
        status: 400,
      });
    }

    if (!BOOKING_START_TIMES.includes(startTime)) {
      return NextResponse.json(errorResponse("預約時段不正確。"), {
        status: 400,
      });
    }

    if (!customerName) {
      return NextResponse.json(errorResponse("請填寫姓名。"), {
        status: 400,
      });
    }

    if (!customerPhone) {
      return NextResponse.json(errorResponse("請填寫電話。"), {
        status: 400,
      });
    }

    if (!customerEmail) {
      return NextResponse.json(errorResponse("請填寫 Email。"), {
        status: 400,
      });
    }

    if (!isValidEmail(customerEmail)) {
      return NextResponse.json(errorResponse("Email 格式不正確。"), {
        status: 400,
      });
    }

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service) {
      return NextResponse.json(errorResponse("找不到此服務項目。"), {
        status: 404,
      });
    }

    if (!service.isActive) {
      return NextResponse.json(errorResponse("此服務目前已停用，無法預約。"), {
        status: 400,
      });
    }

    const prismaBookingDate = toPrismaDate(bookingDate);

    const existingBooking = await prisma.booking.findFirst({
      where: {
        serviceId,
        bookingDate: prismaBookingDate,
        startTime,
        status: {
          not: "cancelled",
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        errorResponse("這個服務在此日期與時段已被預約，請選擇其他時段。"),
        { status: 409 },
      );
    }

    const endTime = addMinutesToTime(startTime, service.durationMinutes);

    const booking = await prisma.booking.create({
      data: {
        serviceId,
        customerName,
        customerPhone,
        customerEmail,
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

    return NextResponse.json(
      successResponse(
        {
          id: booking.id,
          serviceName: booking.service.name,
          bookingDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          customerName: booking.customerName,
          status: booking.status,
        },
        "預約建立成功。",
      ),
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(errorResponse("建立預約失敗，請稍後再試。"), {
      status: 500,
    });
  }
}