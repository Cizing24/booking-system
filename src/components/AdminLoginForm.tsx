"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { FormMessage } from "@/src/components/ui/FormMessage";

type LoginResponse =
  | {
      success: true;
      data: {
        id: string;
        email: string;
      };
      message?: string;
    }
  | {
      success: false;
      error: string;
    };

export function AdminLoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    if (!email.trim()) {
      setMessage("請輸入 Email。");
      return;
    }

    if (!password) {
      setMessage("請輸入密碼。");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = (await response.json()) as LoginResponse;

      if (!response.ok || !result.success) {
        setMessage(result.success ? "登入失敗。" : result.error);
        return;
      }

      router.push("/admin/bookings");
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage("系統暫時無法登入，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl bg-white p-8 shadow-sm"
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Admin
      </p>

      <h1 className="mt-3 text-3xl font-bold text-slate-950">管理員登入</h1>

      <div className="mt-8 grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <Input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setMessage("");
            }}
            placeholder="admin@example.com"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">密碼</span>
          <Input
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setMessage("");
            }}
            placeholder="請輸入密碼"
          />
        </label>

        {message ? <FormMessage variant="error">{message}</FormMessage> : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "登入中..." : "登入"}
        </Button>
      </div>
    </form>
  );
}