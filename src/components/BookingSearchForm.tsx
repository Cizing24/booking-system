"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { FormMessage } from "@/src/components/ui/FormMessage";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import {
  type BookingStatus,
  getBookingStatusText,
} from "@/src/lib/booking-status";

type BookingSearchResult = {
  id: string;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: string;
};

type ApiSearchBookingResponse =
  | {
      success: true;
      data: BookingSearchResult[];
      message?: string;
    }
  | {
      success: false;
      error: string;
    };

type MessageVariant = "default" | "error" | "success";

export function BookingSearchForm() {
  const [keyword, setKeyword] = useState("");
  const [bookings, setBookings] = useState<BookingSearchResult[]>([]);
  const [message, setMessage] = useState("");
  const [messageVariant, setMessageVariant] =
    useState<MessageVariant>("default");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  function showMessage(value: string, variant: MessageVariant = "default") {
    setMessage(value);
    setMessageVariant(variant);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setBookings([]);
    setHasSearched(false);

    if (!keyword.trim()) {
      showMessage("請輸入 Email 或電話。", "error");
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch("/api/bookings/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword,
        }),
      });

      const result = (await response.json()) as ApiSearchBookingResponse;

      if (!response.ok || !result.success) {
        showMessage(result.success ? "查詢失敗。" : result.error, "error");
        return;
      }

      setBookings(result.data);
      setHasSearched(true);

      if (result.data.length === 0) {
        showMessage("查無預約紀錄。請確認 Email 或電話是否正確。");
      }
    } catch (error) {
      console.error(error);
      showMessage("系統暫時無法查詢預約，請稍後再試。", "error");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="grid gap-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">
              Email 或電話
            </span>
            <Input
              type="text"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setMessage("");
              }}
              placeholder="請輸入 Email 或電話"
            />
          </label>

          {message ? (
            <FormMessage variant={messageVariant}>{message}</FormMessage>
          ) : null}

          <Button type="submit" disabled={isSearching}>
            {isSearching ? "查詢中..." : "查詢預約"}
          </Button>
        </div>
      </form>

      {hasSearched && bookings.length > 0 ? (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    {booking.serviceName}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {booking.bookingDate}｜{booking.startTime} -{" "}
                    {booking.endTime}
                  </p>
                </div>

                <StatusBadge variant={booking.status}>
                  {getBookingStatusText(booking.status)}
                </StatusBadge>
              </div>

              <dl className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">姓名</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {booking.customerName}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-500">電話</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {booking.customerPhone}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-500">Email</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {booking.customerEmail}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-500">建立時間</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {new Date(booking.createdAt).toLocaleString("zh-TW")}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}