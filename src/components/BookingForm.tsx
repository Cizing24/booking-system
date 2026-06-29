"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { Textarea } from "@/src/components/ui/Textarea";
import { FormMessage } from "@/src/components/ui/FormMessage";
import { BOOKING_START_TIMES, addMinutesToTime } from "@/src/lib/booking-time";
import {
  MAX_PARTY_SIZE,
  MIN_PARTY_SIZE,
} from "@/src/lib/booking-capacity";

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

type AvailabilitySlot = {
  startTime: string;
  endTime: string;
  isBooked: boolean;
  isAvailable: boolean;
  reason: string | null;
};

type BookingAvailability = {
  date: string;
  dailyGroupLimit: number;
  bookedGroupCount: number;
  isFullyBooked: boolean;
  slots: AvailabilitySlot[];
};

type ApiAvailabilityResponse =
  | {
      success: true;
      data: BookingAvailability;
      message?: string;
    }
  | {
      success: false;
      message: string;
    };

type ApiCreateBookingResponse =
  | {
      success: true;
      data: {
        booking: {
          id: string;
          serviceName: string;
          customerName: string;
          customerPhone: string;
          customerEmail: string;
          partySize: number;
          bookingDate: string;
          startTime: string;
          endTime: string;
          note: string | null;
          status: string;
        };
        bookingId: string;
      };
      message?: string;
    }
  | {
      success: false;
      message: string;
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
  const [partySize, setPartySize] = useState("1");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [note, setNote] = useState("");
  const [availability, setAvailability] =
    useState<BookingAvailability | null>(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [message, setMessage] = useState("");
  const [messageVariant, setMessageVariant] =
    useState<MessageVariant>("default");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedService = useMemo(() => {
    return services.find((service) => service.id === serviceId);
  }, [services, serviceId]);

  const timeOptions = useMemo(() => {
    if (availability) {
      return availability.slots;
    }

    if (!selectedService) {
      return [];
    }

    return BOOKING_START_TIMES.map((time) => ({
      startTime: time,
      endTime: addMinutesToTime(time, selectedService.durationMinutes),
      isBooked: false,
      isAvailable: true,
      reason: null,
    }));
  }, [availability, selectedService]);

  const isTimeSelectDisabled =
    !selectedService ||
    !bookingDate ||
    isLoadingAvailability ||
    Boolean(selectedService && bookingDate && !availability);

  function showMessage(value: string, variant: MessageVariant = "default") {
    setMessage(value);
    setMessageVariant(variant);
  }

  useEffect(() => {
    let ignore = false;

    async function loadAvailability() {
      if (!serviceId || !bookingDate) {
        setAvailability(null);
        return;
      }

      setAvailability(null);
      setStartTime("");
      setIsLoadingAvailability(true);

      try {
        const params = new URLSearchParams({
          serviceId,
          date: bookingDate,
        });

        const response = await fetch(
          `/api/bookings/availability?${params.toString()}`,
        );

        const result = (await response.json()) as ApiAvailabilityResponse;

        if (ignore) {
          return;
        }

        if (!response.ok || !result.success) {
          setAvailability(null);
          showMessage(
            result.success ? "無法取得時段狀態。" : result.message,
            "error",
          );
          return;
        }

        setAvailability(result.data);

        if (result.data.isFullyBooked) {
          showMessage(
            `此日期已達每日 ${result.data.dailyGroupLimit} 組預約上限，請選擇其他日期。`,
            "error",
          );
        } else {
          setMessage("");
        }
      } catch (error) {
        console.error(error);

        if (!ignore) {
          setAvailability(null);
          showMessage("系統暫時無法取得可預約時段。", "error");
        }
      } finally {
        if (!ignore) {
          setIsLoadingAvailability(false);
        }
      }
    }

    loadAvailability();

    return () => {
      ignore = true;
    };
  }, [serviceId, bookingDate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const parsedPartySize = Number(partySize);

    if (!serviceId) {
      showMessage("請選擇服務。", "error");
      return;
    }

    if (!bookingDate) {
      showMessage("請選擇預約日期。", "error");
      return;
    }

    if (availability?.isFullyBooked) {
      showMessage(
        `此日期已達每日 ${availability.dailyGroupLimit} 組預約上限，請選擇其他日期。`,
        "error",
      );
      return;
    }

    if (!startTime) {
      showMessage("請選擇預約時段。", "error");
      return;
    }

    const selectedSlot = availability?.slots.find(
      (slot) => slot.startTime === startTime,
    );

    if (selectedSlot && !selectedSlot.isAvailable) {
      showMessage(
        selectedSlot.reason
          ? `此時段${selectedSlot.reason}，請選擇其他時段。`
          : "此時段目前無法預約，請選擇其他時段。",
        "error",
      );
      return;
    }

    if (
      !Number.isInteger(parsedPartySize) ||
      parsedPartySize < MIN_PARTY_SIZE ||
      parsedPartySize > MAX_PARTY_SIZE
    ) {
      showMessage(
        `預約人數需為 ${MIN_PARTY_SIZE}～${MAX_PARTY_SIZE} 人。`,
        "error",
      );
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
          partySize: parsedPartySize,
          customerName,
          customerPhone,
          customerEmail,
          note,
        }),
      });

      const result = (await response.json()) as ApiCreateBookingResponse;

      if (!response.ok || !result.success) {
        showMessage(
          result.success ? "建立預約失敗。" : result.message,
          "error",
        );
        return;
      }

      const bookingId = result.data.bookingId;

      if (!bookingId) {
        showMessage("建立預約成功，但找不到預約編號。請聯絡管理者。", "error");
        return;
      }

      router.push(`/booking/success?bookingId=${bookingId}`);
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
              setAvailability(null);
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
              setStartTime("");
              setAvailability(null);
              setMessage("");
            }}
          />
        </label>

        {availability ? (
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-900">當日預約狀態</p>
            <p className="mt-1">
              已預約 {availability.bookedGroupCount} /{" "}
              {availability.dailyGroupLimit} 組
            </p>
          </div>
        ) : null}

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">時段</span>
          <Select
            value={startTime}
            onChange={(event) => {
              setStartTime(event.target.value);
              setMessage("");
            }}
            disabled={isTimeSelectDisabled}
          >
            <option value="">
              {!selectedService
                ? "請先選擇服務"
                : !bookingDate
                  ? "請先選擇日期"
                  : isLoadingAvailability
                    ? "載入時段中..."
                    : !availability
                      ? "時段狀態無法載入"
                      : "請選擇時段"}
            </option>

            {!isLoadingAvailability && availability
              ? timeOptions.map((option) => (
                  <option
                    key={option.startTime}
                    value={option.startTime}
                    disabled={!option.isAvailable}
                  >
                    {option.startTime} - {option.endTime}
                    {option.isAvailable
                      ? "｜可預約"
                      : `｜${option.reason ?? "不可預約"}`}
                  </option>
                ))
              : null}
          </Select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">預約人數</span>
          <Input
            type="number"
            min={MIN_PARTY_SIZE}
            max={MAX_PARTY_SIZE}
            value={partySize}
            onChange={(event) => {
              setPartySize(event.target.value);
              setMessage("");
            }}
            placeholder={`請輸入 ${MIN_PARTY_SIZE}～${MAX_PARTY_SIZE} 人`}
          />
          <p className="text-xs text-slate-500">
            每組最多 {MAX_PARTY_SIZE} 人。
          </p>
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

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isLoadingAvailability}
        >
          {isSubmitting ? "送出中..." : "送出預約"}
        </Button>
      </div>
    </form>
  );
}