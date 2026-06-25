import Link from "next/link";
import { AdminLogoutButton } from "@/src/components/AdminLogoutButton";

type AdminNavProps = {
  email: string;
};

export function AdminNav({ email }: AdminNavProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <Link href="/admin/bookings" className="text-lg font-bold text-slate-950">
            預約系統後台
          </Link>

          <p className="mt-1 text-sm text-slate-500">目前登入：{email}</p>
        </div>

        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/admin/bookings"
            className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
          >
            預約管理
          </Link>

          <Link
            href="/admin/services"
            className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
          >
            服務管理
          </Link>

          <AdminLogoutButton />
        </nav>
      </div>
    </header>
  );
}