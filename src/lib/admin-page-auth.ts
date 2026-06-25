import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/src/lib/auth";

export async function requireAdminUser() {
  const adminUser = await getCurrentAdminUser();

  if (!adminUser) {
    redirect("/admin/login");
  }

  return adminUser;
}

export async function redirectIfAdminLoggedIn() {
  const adminUser = await getCurrentAdminUser();

  if (adminUser) {
    redirect("/admin/bookings");
  }
}