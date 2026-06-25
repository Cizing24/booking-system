"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import { Select } from "@/src/components/ui/Select";
import { FormMessage } from "@/src/components/ui/FormMessage";

type BookingStatus = "pending" | "confirmed" | "cancelled";

type BookingStatusFormProps = {
  bookingId: string;
  currentStatus: BookingStatus;
};

type UpdateStatusResponse =
  | {
      success: true;
      data: {
        id: string;
        status: BookingStatus;
        serviceName: string;
      };
      message?: string;
    }
  | {
      success: false;
      error: string;
    };

type MessageVariant = "default" | "error" | "success";

export function BookingStatusForm({
  bookingId,
  currentStatus,
}: BookingStatusFormProps) {
  const router = useRouter();

  const [status, setStatus] = useState<BookingStatus>(currentStatus);
  const [message, setMessage] = useState("");
  const [messageVariant, setMessageVariant] =
    useState<MessageVariant>("default");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function showMessage(value: string, variant: MessageVariant = "default") {
    setMessage(value);
    setMessageVariant(variant);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      const result = (await response.json()) as UpdateStatusResponse;

      if (!response.ok || !result.success) {
        showMessage(result.success ? "更新失敗。" : result.error, "error");
        return;
      }

      showMessage("預約狀態已更新。", "success");
      router.refresh();
    } catch (error) {
      console.error(error);
      showMessage("系統暫時無法更新預約狀態，請稍後再試。", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">預約狀態</span>
        <Select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as BookingStatus);
            setMessage("");
          }}
        >
          <option value="pending">pending，待確認</option>
          <option value="confirmed">confirmed，已確認</option>
          <option value="cancelled">cancelled，已取消</option>
        </Select>
      </label>

      {message ? (
        <FormMessage variant={messageVariant}>{message}</FormMessage>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "更新中..." : "更新狀態"}
      </Button>
    </form>
  );
}