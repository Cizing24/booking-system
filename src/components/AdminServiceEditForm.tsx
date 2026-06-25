"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { FormMessage } from "@/src/components/ui/FormMessage";

type AdminServiceEditFormProps = {
  service: {
    id: string;
    name: string;
    description: string;
    durationMinutes: number;
    price: number;
  };
};

type UpdateServiceResponse =
  | {
      success: true;
      data: {
        id: string;
        name: string;
        description: string;
        durationMinutes: number;
        price: number;
        isActive: boolean;
      };
      message?: string;
    }
  | {
      success: false;
      error: string;
    };

export function AdminServiceEditForm({ service }: AdminServiceEditFormProps) {
  const router = useRouter();

  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description);
  const [durationMinutes, setDurationMinutes] = useState(
    String(service.durationMinutes),
  );
  const [price, setPrice] = useState(String(service.price));
  const [message, setMessage] = useState("");
  const [messageVariant, setMessageVariant] = useState<"default" | "error" | "success">(
    "default",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  function showMessage(
    value: string,
    variant: "default" | "error" | "success" = "default",
  ) {
    setMessage(value);
    setMessageVariant(variant);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    if (!name.trim()) {
      showMessage("請輸入服務名稱。", "error");
      return;
    }

    if (!description.trim()) {
      showMessage("請輸入服務說明。", "error");
      return;
    }

    const parsedDuration = Number(durationMinutes);
    const parsedPrice = Number(price);

    if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
      showMessage("服務時長必須是大於 0 的整數。", "error");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      showMessage("價格必須是 0 或大於 0 的數字。", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          durationMinutes: parsedDuration,
          price: parsedPrice,
        }),
      });

      const result = (await response.json()) as UpdateServiceResponse;

      if (!response.ok || !result.success) {
        showMessage(result.success ? "更新服務失敗。" : result.error, "error");
        return;
      }

      showMessage("服務已更新。", "success");
      router.refresh();
    } catch (error) {
      console.error(error);
      showMessage("系統暫時無法更新服務，請稍後再試。", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <details className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <summary className="cursor-pointer text-sm font-medium text-slate-900">
        編輯服務內容
      </summary>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">服務名稱</span>
          <Input
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setMessage("");
            }}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">服務說明</span>
          <Textarea
            rows={4}
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setMessage("");
            }}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">
            服務時長，分鐘
          </span>
          <Input
            type="number"
            min="1"
            value={durationMinutes}
            onChange={(event) => {
              setDurationMinutes(event.target.value);
              setMessage("");
            }}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">價格</span>
          <Input
            type="number"
            min="0"
            value={price}
            onChange={(event) => {
              setPrice(event.target.value);
              setMessage("");
            }}
          />
        </label>

        {message ? (
          <FormMessage variant={messageVariant}>{message}</FormMessage>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "儲存中..." : "儲存修改"}
        </Button>
      </form>
    </details>
  );
}