"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/src/components/ui/Button";

type ServiceStatusButtonProps = {
  serviceId: string;
  isActive: boolean;
};

type UpdateServiceResponse =
  | {
      success: true;
      data: {
        id: string;
        name: string;
        isActive: boolean;
      };
      message?: string;
    }
  | {
      success: false;
      error: string;
    };

export function ServiceStatusButton({
  serviceId,
  isActive,
}: ServiceStatusButtonProps) {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !isActive,
        }),
      });

      const result = (await response.json()) as UpdateServiceResponse;

      if (!response.ok || !result.success) {
        setMessage(result.success ? "更新失敗。" : result.error);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage("系統暫時無法更新服務狀態，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={handleClick}
        disabled={isSubmitting}
      >
        {isSubmitting ? "更新中..." : isActive ? "停用" : "啟用"}
      </Button>

      {message ? <p className="text-xs text-rose-700">{message}</p> : null}
    </div>
  );
}