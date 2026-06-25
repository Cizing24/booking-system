import { PageHeader } from "@/src/components/PageHeader";
import { BookingSearchForm } from "@/src/components/BookingSearchForm";

export default function BookingSearchPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <section className="mx-auto max-w-3xl">
        <PageHeader
          title="查詢預約"
          description="請使用預約時填寫的 Email 或電話查詢自己的預約紀錄。"
        />

        <BookingSearchForm />
      </section>
    </main>
  );
}