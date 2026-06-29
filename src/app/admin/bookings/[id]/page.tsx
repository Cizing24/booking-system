import Link from "next/link";
import { PageHeader } from "@/src/components/PageHeader";
import { AdminNav } from "@/src/components/AdminNav";
import { BookingStatusForm } from "@/src/components/BookingStatusForm";
import { requireAdminUser } from "@/src/lib/admin-page-auth";
import { prisma } from "@/src/lib/prisma";
import { formatDateString } from "@/src/lib/date";
import { notFound } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BookingStatus = "pending" | "confirmed" | "cancelled";

type AdminBookingDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: process.env.APP_TIME_ZONE || "Asia/Taipei",
  }).format(date);
}

function getStatusText(status: BookingStatus) {
  const statusMap: Record<BookingStatus, string> = {
    pending: "待確認",
    confirmed: "已確認",
    cancelled: "已取消",
  };

  return statusMap[status];
}

function getStatusClassName(status: BookingStatus) {
  const classMap: Record<BookingStatus, string> = {
    pending: "bg-amber-50 text-amber-700",
    confirmed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-rose-50 text-rose-700",
  };

  return classMap[status];
}

export default async function AdminBookingDetailPage({
  params,
}: AdminBookingDetailPageProps) {
  const adminUser = await requireAdminUser();
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) {
  notFound();
  }

  const booking = await prisma.booking.findUnique({
    where: {
      id,
    },
    include: {
      service: true,
    },
});

  if (!booking) {
    return (
      <main className="min-h-screen bg-slate-50">
        <AdminNav email={adminUser.email} />

        <section className="mx-auto max-w-3xl px-6 py-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-950">
              找不到預約資料
            </h1>

            <p className="mt-4 text-slate-600">
              這筆預約可能不存在，或已經被刪除。
            </p>

            <Link
              href="/admin/bookings"
              className="mt-8 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700"
            >
              返回預約管理
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const status = booking.status as BookingStatus;

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav email={adminUser.email} />

      <section className="mx-auto max-w-3xl px-6 py-12">
        <PageHeader
          title="預約詳細資料"
          description="管理者可以查看單筆預約完整資訊，並修改預約狀態。"
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <dl className="grid gap-4 text-sm">
            <div className="flex justify-between gap-6 border-b border-slate-100 pb-3">
              <dt className="text-slate-500">使用者姓名</dt>
              <dd className="font-medium text-slate-900">
                {booking.customerName}
              </dd>
            </div>

            <div className="flex justify-between gap-6 border-b border-slate-100 pb-3">
              <dt className="text-slate-500">電話</dt>
              <dd className="font-medium text-slate-900">
                {booking.customerPhone}
              </dd>
            </div>

            <div className="flex justify-between gap-6 border-b border-slate-100 pb-3">
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">
                {booking.customerEmail}
              </dd>
            </div>

            <div className="flex justify-between gap-6 border-b border-slate-100 pb-3">
              <dt className="text-slate-500">預約人數</dt>
              <dd className="font-medium text-slate-900">
                {booking.partySize} 人
              </dd>
            </div>

            <div className="flex justify-between gap-6 border-b border-slate-100 pb-3">
              <dt className="text-slate-500">預約服務</dt>
              <dd className="font-medium text-slate-900">
                {booking.service.name}
              </dd>
            </div>

            <div className="flex justify-between gap-6 border-b border-slate-100 pb-3">
              <dt className="text-slate-500">服務時長</dt>
              <dd className="font-medium text-slate-900">
                {booking.service.durationMinutes} 分鐘
              </dd>
            </div>

            <div className="flex justify-between gap-6 border-b border-slate-100 pb-3">
              <dt className="text-slate-500">服務價格</dt>
              <dd className="font-medium text-slate-900">
                NT$ {Number(booking.service.price.toString())}
              </dd>
            </div>

            <div className="flex justify-between gap-6 border-b border-slate-100 pb-3">
              <dt className="text-slate-500">預約日期</dt>
              <dd className="font-medium text-slate-900">
                {formatDateString(booking.bookingDate)}
              </dd>
            </div>

            <div className="flex justify-between gap-6 border-b border-slate-100 pb-3">
              <dt className="text-slate-500">預約時段</dt>
              <dd className="font-medium text-slate-900">
                {booking.startTime} - {booking.endTime}
              </dd>
            </div>

            <div className="flex justify-between gap-6 border-b border-slate-100 pb-3">
              <dt className="text-slate-500">備註</dt>
              <dd className="max-w-md text-right font-medium text-slate-900">
                {booking.note || "無"}
              </dd>
            </div>

            <div className="flex justify-between gap-6 border-b border-slate-100 pb-3">
              <dt className="text-slate-500">預約狀態</dt>
              <dd>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClassName(
                    status,
                  )}`}
                >
                  {getStatusText(status)}
                </span>
              </dd>
            </div>

            <div className="flex justify-between gap-6 border-b border-slate-100 pb-3">
              <dt className="text-slate-500">建立時間</dt>
              <dd className="font-medium text-slate-900">
                {formatDateTime(booking.createdAt)}
              </dd>
            </div>

            <div className="flex justify-between gap-6">
              <dt className="text-slate-500">更新時間</dt>
              <dd className="font-medium text-slate-900">
                {formatDateTime(booking.updatedAt)}
              </dd>
            </div>
          </dl>

          <BookingStatusForm bookingId={booking.id} currentStatus={status} />
        </div>

        <div className="mt-6">
          <Link
            href="/admin/bookings"
            className="text-sm font-medium text-slate-700 underline"
          >
            返回預約管理
          </Link>
        </div>
      </section>
    </main>
  );
}