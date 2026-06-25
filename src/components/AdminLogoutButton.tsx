"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/src/components/ui/Button";

export function AdminLogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });

      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleLogout}
      disabled={isSubmitting}
    >
      {isSubmitting ? "登出中..." : "登出"}
    </Button>
  );
}