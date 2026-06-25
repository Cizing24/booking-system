import { PageHeader } from "@/src/components/PageHeader";
import { AdminNav } from "@/src/components/AdminNav";
import { AdminServiceForm } from "@/src/components/AdminServiceForm";
import { AdminServiceEditForm } from "@/src/components/AdminServiceEditForm";
import { ServiceStatusButton } from "@/src/components/ServiceStatusButton";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { requireAdminUser } from "@/src/lib/admin-page-auth";
import { prisma } from "@/src/lib/prisma";
import { formatDateTime, formatPrice } from "@/src/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getServices() {
  const services = await prisma.service.findMany({
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
    isActive: service.isActive,
    createdAt: formatDateTime(service.createdAt),
    updatedAt: formatDateTime(service.updatedAt),
  }));
}

export default async function AdminServicesPage() {
  const adminUser = await requireAdminUser();
  const services = await getServices();

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav email={adminUser.email} />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <PageHeader
          title="服務管理"
          description="管理者可以新增服務項目，並啟用、停用或編輯既有服務。"
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <AdminServiceForm />

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">服務列表</h2>

            {services.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600">
                目前沒有任何服務項目。
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {services.map((service) => (
                  <article
                    key={service.id}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-950">
                          {service.name}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {service.description}
                        </p>

                        <p className="mt-3 text-sm text-slate-700">
                          {service.durationMinutes} 分鐘｜
                          {formatPrice(service.price)}
                        </p>

                        <dl className="mt-4 grid gap-2 text-xs text-slate-500">
                          <div>
                            <dt className="inline">建立時間：</dt>
                            <dd className="inline">{service.createdAt}</dd>
                          </div>

                          <div>
                            <dt className="inline">更新時間：</dt>
                            <dd className="inline">{service.updatedAt}</dd>
                          </div>
                        </dl>
                      </div>

                      {service.isActive ? (
                        <StatusBadge variant="active" className="shrink-0">
                          啟用中
                        </StatusBadge>
                      ) : (
                        <StatusBadge variant="inactive" className="shrink-0">
                          已停用
                        </StatusBadge>
                      )}
                    </div>

                    <div className="mt-5">
                      <ServiceStatusButton
                        serviceId={service.id}
                        isActive={service.isActive}
                      />

                      <AdminServiceEditForm
                        service={{
                          id: service.id,
                          name: service.name,
                          description: service.description,
                          durationMinutes: service.durationMinutes,
                          price: service.price,
                        }}
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}