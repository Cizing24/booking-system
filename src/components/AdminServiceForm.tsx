"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { FormMessage } from "@/src/components/ui/FormMessage";

type CreateServiceResponse =
  | {
      success: true;
      data: {
        id: string;
        name: string;
      };
      message?: string;
    }
  | {
      success: false;
      error: string;
    };

export function AdminServiceForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [price, setPrice] = useState("1000");
  const [isActive, setIsActive] = useState(true);
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
      const response = await fetch("/api/admin/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          durationMinutes: parsedDuration,
          price: parsedPrice,
          isActive,
        }),
      });

      const result = (await response.json()) as CreateServiceResponse;

      if (!response.ok || !result.success) {
        showMessage(result.success ? "新增服務失敗。" : result.error, "error");
        return;
      }

      setName("");
      setDescription("");
      setDurationMinutes("60");
      setPrice("1000");
      setIsActive(true);
      showMessage("服務已新增。", "success");

      router.refresh();
    } catch (error) {
      console.error(error);
      showMessage("系統暫時無法新增服務，請稍後再試。", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold text-slate-950">新增服務</h2>

      <div className="mt-6 grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">服務名稱</span>
          <Input
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setMessage("");
            }}
            placeholder="請輸入服務名稱"
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
            placeholder="請輸入服務說明"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">
            服務時長，分鐘
          </span>
          <Input
            type="number"
            value={durationMinutes}
            onChange={(event) => {
              setDurationMinutes(event.target.value);
              setMessage("");
            }}
            min="1"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">價格</span>
          <Input
            type="number"
            value={price}
            onChange={(event) => {
              setPrice(event.target.value);
              setMessage("");
            }}
            min="0"
          />
        </label>

        <label className="flex items-center gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => {
              setIsActive(event.target.checked);
              setMessage("");
            }}
          />
          啟用服務
        </label>

        {message ? (
          <FormMessage variant={messageVariant}>{message}</FormMessage>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "新增中..." : "新增服務"}
        </Button>
      </div>
    </form>
  );
}