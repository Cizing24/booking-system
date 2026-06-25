"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { Textarea } from "@/src/components/ui/Textarea";
import { FormMessage } from "@/src/components/ui/FormMessage";
import { BOOKING_START_TIMES, addMinutesToTime } from "@/src/lib/booking-time";

type BookingService = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
};

type BookingFormProps = {
  services: BookingService[];
  initialServiceId?: string;
};

type ApiCreateBookingResponse =
  | {
      success: true;
      data: {
        id: string;
      };
      message?: string;
    }
  | {
      success: false;
      error: string;
    };

type MessageVariant = "default" | "error" | "success";

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

export function BookingForm({
  services,
  initialServiceId = "",
}: BookingFormProps) {
  const router = useRouter();

  const [serviceId, setServiceId] = useState(initialServiceId);
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [messageVariant, setMessageVariant] =
    useState<MessageVariant>("default");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedService = useMemo(() => {
    return services.find((service) => service.id === serviceId);
  }, [services, serviceId]);

  const timeOptions = useMemo(() => {
    if (!selectedService) {
      return [];
    }

    return BOOKING_START_TIMES.map((time) => ({
      startTime: time,
      endTime: addMinutesToTime(time, selectedService.durationMinutes),
    }));
  }, [selectedService]);

  function showMessage(value: string, variant: MessageVariant = "default") {
    setMessage(value);
    setMessageVariant(variant);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!serviceId) {
      showMessage("請選擇服務。", "error");
      return;
    }

    if (!bookingDate) {
      showMessage("請選擇預約日期。", "error");
      return;
    }

    if (!startTime) {
      showMessage("請選擇預約時段。", "error");
      return;
    }

    if (!customerName.trim()) {
      showMessage("請填寫姓名。", "error");
      return;
    }

    if (!customerPhone.trim()) {
      showMessage("請填寫電話。", "error");
      return;
    }

    if (!customerEmail.trim()) {
      showMessage("請填寫 Email。", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId,
          bookingDate,
          startTime,
          customerName,
          customerPhone,
          customerEmail,
          note,
        }),
      });

      const result = (await response.json()) as ApiCreateBookingResponse;

      if (!response.ok || !result.success) {
        showMessage(result.success ? "建立預約失敗。" : result.error, "error");
        return;
      }

      router.push(`/booking/success?bookingId=${result.data.id}`);
    } catch (error) {
      console.error(error);
      showMessage("系統暫時無法建立預約，請稍後再試。", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">服務</span>
          <Select
            value={serviceId}
            onChange={(event) => {
              setServiceId(event.target.value);
              setStartTime("");
              setMessage("");
            }}
          >
            <option value="">請選擇服務</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}，{service.durationMinutes} 分鐘
              </option>
            ))}
          </Select>
        </label>

        {selectedService ? (
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-900">{selectedService.name}</p>
            <p className="mt-1">{selectedService.description}</p>
            <p className="mt-2">
              時長：{selectedService.durationMinutes} 分鐘｜價格：NT${" "}
              {selectedService.price}
            </p>
          </div>
        ) : null}

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">日期</span>
          <Input
            type="date"
            min={getTodayString()}
            value={bookingDate}
            onChange={(event) => {
              setBookingDate(event.target.value);
              setMessage("");
            }}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">時段</span>
          <Select
            value={startTime}
            onChange={(event) => {
              setStartTime(event.target.value);
              setMessage("");
            }}
            disabled={!selectedService}
          >
            <option value="">請選擇時段</option>
            {timeOptions.map((option) => (
              <option key={option.startTime} value={option.startTime}>
                {option.startTime} - {option.endTime}
              </option>
            ))}
          </Select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">姓名</span>
          <Input
            type="text"
            value={customerName}
            onChange={(event) => {
              setCustomerName(event.target.value);
              setMessage("");
            }}
            placeholder="請輸入姓名"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">電話</span>
          <Input
            type="tel"
            value={customerPhone}
            onChange={(event) => {
              setCustomerPhone(event.target.value);
              setMessage("");
            }}
            placeholder="請輸入電話"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <Input
            type="email"
            value={customerEmail}
            onChange={(event) => {
              setCustomerEmail(event.target.value);
              setMessage("");
            }}
            placeholder="請輸入 Email"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">備註</span>
          <Textarea
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
              setMessage("");
            }}
            placeholder="可填寫其他需求"
            rows={4}
          />
        </label>

        {message ? (
          <FormMessage variant={messageVariant}>{message}</FormMessage>
        ) : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "送出中..." : "送出預約"}
        </Button>
      </div>
    </form>
  );
}