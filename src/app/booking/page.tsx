import { PageHeader } from "@/src/components/PageHeader";
import { BookingForm } from "@/src/components/BookingForm";
import { prisma } from "@/src/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BookingPageProps = {
  searchParams: Promise<{
    serviceId?: string | string[];
  }>;
};

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

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = await searchParams;
  const rawServiceId = params.serviceId;
  const initialServiceId = Array.isArray(rawServiceId)
    ? rawServiceId[0]
    : rawServiceId ?? "";

  const services = await getActiveServices();

  const isValidInitialService = services.some(
    (service) => service.id === initialServiceId,
  );

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <section className="mx-auto max-w-3xl">
        <PageHeader
          title="建立預約"
          description="請選擇服務、日期與時段，並填寫基本資料。"
        />

        <BookingForm
          services={services}
          initialServiceId={isValidInitialService ? initialServiceId : ""}
        />
      </section>
    </main>
  );
}