import Link from "next/link";
import { PageHeader } from "@/src/components/PageHeader";
import { AdminNav } from "@/src/components/AdminNav";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { requireAdminUser } from "@/src/lib/admin-page-auth";
import { prisma } from "@/src/lib/prisma";
import { formatDateString } from "@/src/lib/date";
import { formatDateTime } from "@/src/lib/format";
import {
  type BookingStatus,
  getBookingStatusText,
} from "@/src/lib/booking-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getBookings() {
  const bookings = await prisma.booking.findMany({
    include: {
      service: true,
    },
    orderBy: [
      {
        bookingDate: "desc",
      },
      {
        startTime: "asc",
      },
    ],
  });

  return bookings.map((booking) => ({
    id: booking.id,
    bookingDate: formatDateString(booking.bookingDate),
    time: `${booking.startTime} - ${booking.endTime}`,
    serviceName: booking.service.name,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    customerEmail: booking.customerEmail,
    partySize: booking.partySize,
    status: booking.status as BookingStatus,
    createdAt: formatDateTime(booking.createdAt),
  }));
}

export default async function AdminBookingsPage() {
  const adminUser = await requireAdminUser();
  const bookings = await getBookings();

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav email={adminUser.email} />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <PageHeader
          title="預約管理"
          description="管理者可以查看所有預約紀錄，並進入詳細頁修改預約狀態。"
        />

        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            目前沒有任何預約紀錄。
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-4 py-3">預約日期</th>
                  <th className="px-4 py-3">預約時段</th>
                  <th className="px-4 py-3">服務名稱</th>
                  <th className="px-4 py-3">使用者姓名</th>
                  <th className="px-4 py-3">電話</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">人數</th>
                  <th className="px-4 py-3">預約狀態</th>
                  <th className="px-4 py-3">建立時間</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-t border-slate-100 align-top"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {booking.bookingDate}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {booking.time}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {booking.serviceName}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {booking.customerName}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {booking.customerPhone}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {booking.customerEmail}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {booking.partySize} 人
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge variant={booking.status}>
                        {getBookingStatusText(booking.status)}
                      </StatusBadge>
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {booking.createdAt}
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="font-medium text-slate-900 underline"
                      >
                        查看詳細資料
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}