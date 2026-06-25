import { ButtonLink } from "@/src/components/ui/Button";

const features = [
  {
    title: "快速預約",
    description: "使用者可以選擇服務、日期與時段，填寫基本資料後送出預約。",
  },
  {
    title: "服務管理",
    description: "管理者可以新增、編輯、啟用或停用服務項目。",
  },
  {
    title: "預約管理",
    description: "管理者可以查看預約紀錄，並將預約狀態改為確認或取消。",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Universal Booking System
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            通用型預約系統
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            這是一個乾淨、可擴充的預約網站。第一版支援服務列表、線上預約、
            預約查詢與管理者後台，後續可延伸為課程、美容、諮詢、診所或活動預約系統。
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href="/booking">開始預約</ButtonLink>
            <ButtonLink href="/services" variant="outline">
              查看服務
            </ButtonLink>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-950">
                {feature.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}