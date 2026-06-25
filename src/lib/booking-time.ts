export const BOOKING_START_TIMES = [
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
];

export function addMinutesToTime(time: string, minutes: number) {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hour, minute, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);

  const endHour = String(date.getHours()).padStart(2, "0");
  const endMinute = String(date.getMinutes()).padStart(2, "0");

  return `${endHour}:${endMinute}`;
}