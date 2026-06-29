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
  partySize: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: string;
};

type ApiSearchBookingResponse =
  | {
      success: true;
      data: {
        bookings: BookingSearchResult[];
      };
      message?: string;
    }
  | {
      success: false;
      message: string;
    };

type MessageVariant = "default" | "error" | "success";

export function BookingSearchForm() {
  const [keyword, setKeyword] = useState("");
  const [bookings, setBookings] = useState<BookingSearchResult[]>([]);
  const [message, setMessage] = useState("");
  const [messageVariant, setMessageVariant] =
    useState<MessageVariant>("default");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  function showMessage(value: string, variant: MessageVariant = "default") {
    setMessage(value);
    setMessageVariant(variant);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedKeyword = keyword.trim();

    setMessage("");
    setBookings([]);
    setHasSearched(false);

    if (!trimmedKeyword) {
      showMessage("請輸入 Email 或電話。", "error");
      return;
    }

    if (trimmedKeyword.length < 3) {
      showMessage("查詢條件至少需要 3 個字元。", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword: trimmedKeyword,
        }),
      });

      const result = (await response.json()) as ApiSearchBookingResponse;

      if (!response.ok || !result.success) {
        showMessage(result.success ? "查詢失敗。" : result.message, "error");
        return;
      }

      const searchedBookings = result.data.bookings;

      setBookings(searchedBookings);
      setHasSearched(true);

      if (searchedBookings.length === 0) {
        showMessage("查無預約紀錄。請確認 Email 或電話是否正確。");
      }
    } catch (error) {
      console.error(error);
      showMessage("系統暫時無法查詢預約，請稍後再試。", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4">
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

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "查詢中..." : "查詢預約"}
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
                  <h2 className="text-xl font-semibold text-slate-950">
                    {booking.serviceName}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    建立時間：{booking.createdAt}
                  </p>
                </div>

                <StatusBadge variant={booking.status}>
                  {getBookingStatusText(booking.status)}
                </StatusBadge>
              </div>

              <dl className="mt-5 grid gap-3 text-sm text-slate-700">
                <div className="flex justify-between gap-6 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">預約日期</dt>
                  <dd className="font-medium text-slate-900">
                    {booking.bookingDate}
                  </dd>
                </div>

                <div className="flex justify-between gap-6 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">預約時段</dt>
                  <dd className="font-medium text-slate-900">
                    {booking.startTime} - {booking.endTime}
                  </dd>
                </div>

                <div className="flex justify-between gap-6 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">預約人數</dt>
                  <dd className="font-medium text-slate-900">
                    {booking.partySize} 人
                  </dd>
                </div>

                <div className="flex justify-between gap-6 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">姓名</dt>
                  <dd className="font-medium text-slate-900">
                    {booking.customerName}
                  </dd>
                </div>

                <div className="flex justify-between gap-6 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">電話</dt>
                  <dd className="font-medium text-slate-900">
                    {booking.customerPhone}
                  </dd>
                </div>

                <div className="flex justify-between gap-6">
                  <dt className="text-slate-500">Email</dt>
                  <dd className="font-medium text-slate-900">
                    {booking.customerEmail}
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