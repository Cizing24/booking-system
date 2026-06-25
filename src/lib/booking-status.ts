export type BookingStatus = "pending" | "confirmed" | "cancelled";

export function getBookingStatusText(status: BookingStatus) {
  const statusMap: Record<BookingStatus, string> = {
    pending: "待確認",
    confirmed: "已確認",
    cancelled: "已取消",
  };

  return statusMap[status];
}