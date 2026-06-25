import { ButtonLink } from "@/src/components/ui/Button";
import { PageHeader } from "@/src/components/PageHeader";
import { prisma } from "@/src/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatPrice(price: number) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(price);
}

async function getActiveServices() {
  const services = await prisma.service.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return services.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description,
    durationMinutes: service.durationMinutes,
    price: Number(service.price.toString()),
  }));
}

export default async function ServicesPage() {
  const services = await getActiveServices();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <section className="mx-auto max-w-6xl">
        <PageHeader
          title="服務項目"
          description="請選擇想預約的服務。系統只會顯示目前啟用中的服務項目。"
        />

        {services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            目前沒有可預約的服務項目。
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service) => (
              <article
                key={service.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-slate-950">
                  {service.name}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {service.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-700">
                  <span>時長：{service.durationMinutes} 分鐘</span>
                  <span>價格：{formatPrice(service.price)}</span>
                </div>

                <div className="mt-6">
                  <ButtonLink href={`/booking?serviceId=${service.id}`}>
                    預約此服務
                  </ButtonLink>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}