import { prisma } from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";
import { formatDateString } from "@/src/lib/date";
import { formatDateTime } from "@/src/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchBookingBody = {
  keyword?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SearchBookingBody;
    const keyword = body.keyword?.trim() ?? "";

    if (!keyword) {
      return errorResponse("請輸入 Email 或電話。", 400);
    }

    if (keyword.length < 3) {
      return errorResponse("查詢條件至少需要 3 個字元。", 400);
    }

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          {
            customerEmail: {
              contains: keyword,
              mode: "insensitive",
            },
          },
          {
            customerPhone: {
              contains: keyword,
            },
          },
        ],
      },
      include: {
        service: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      serviceName: booking.service.name,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerEmail: booking.customerEmail,
      partySize: booking.partySize,
      bookingDate: formatDateString(booking.bookingDate),
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      createdAt: formatDateTime(booking.createdAt),
    }));

    return successResponse({
      bookings: formattedBookings,
    });
  } catch (error) {
    console.error(error);

    return errorResponse("查詢預約失敗，請稍後再試。", 500);
  }
}