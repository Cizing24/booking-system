import { ButtonLink } from "@/src/components/ui/Button";
import { prisma } from "@/src/lib/prisma";
import { formatDateString } from "@/src/lib/date";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

type BookingSuccessPageProps = {
  searchParams: Promise<{
    bookingId?: string | string[];
  }>;
};

export default async function BookingSuccessPage({
  searchParams,
}: BookingSuccessPageProps) {
  const params = await searchParams;
  const rawBookingId = params.bookingId;
  const bookingId = Array.isArray(rawBookingId)
    ? rawBookingId[0]
    : rawBookingId ?? "";

  const booking = isValidUuid(bookingId)
    ? await prisma.booking.findUnique({
        where: {
          id: bookingId,
        },
        include: {
          service: true,
        },
      })
    : null;

  if (!booking) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-950">
            找不到預約資料
          </h1>

          <p className="mt-4 text-slate-600">
            無法顯示預約成功資訊。請回到服務列表重新建立預約，或稍後使用預約查詢功能查詢。
          </p>

          <div className="mt-8">
            <ButtonLink href="/services">查看服務</ButtonLink>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Booking Created
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950">預約成功</h1>

        <p className="mt-4 text-slate-600">
          系統已建立你的預約。請保留此頁資訊，之後也可以使用 Email 或電話查詢預約紀錄。
        </p>

        <dl className="mt-8 grid gap-4 text-sm">
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <dt className="text-slate-500">預約服務</dt>
            <dd className="font-medium text-slate-900">{booking.service.name}</dd>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-3">
            <dt className="text-slate-500">預約日期</dt>
            <dd className="font-medium text-slate-900">
              {formatDateString(booking.bookingDate)}
            </dd>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-3">
            <dt className="text-slate-500">預約時段</dt>
            <dd className="font-medium text-slate-900">
              {booking.startTime} - {booking.endTime}
            </dd>
          </div>

          <div className="flex justify-between gap-6 border-b border-slate-100 pb-3">
            <dt className="text-slate-500">預約人數</dt>
            <dd className="font-medium text-slate-900">
              {booking.partySize} 人
            </dd>
          </div>  

          <div className="flex justify-between border-b border-slate-100 pb-3">
            <dt className="text-slate-500">使用者姓名</dt>
            <dd className="font-medium text-slate-900">
              {booking.customerName}
            </dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-slate-500">預約狀態</dt>
            <dd className="font-medium text-amber-700">{booking.status}</dd>
          </div>
        </dl>

        <div className="mt-8 flex gap-4">
          <ButtonLink href="/services" variant="outline">
            查看服務
          </ButtonLink>
          <ButtonLink href="/booking/search">查詢預約</ButtonLink>
        </div>
      </section>
    </main>
  );
}