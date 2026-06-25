import { AdminLoginForm } from "@/src/components/AdminLoginForm";
import { redirectIfAdminLoggedIn } from "@/src/lib/admin-page-auth";

export default async function AdminLoginPage() {
  await redirectIfAdminLoggedIn();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12">
      <section className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <AdminLoginForm />
      </section>
    </main>
  );
}