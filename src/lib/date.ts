export function getAppTimeZone() {
  return process.env.APP_TIME_ZONE || "Asia/Taipei";
}

export function getTodayDateString(timeZone = getAppTimeZone()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to format current date");
  }

  return `${year}-${month}-${day}`;
}

export function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function toPrismaDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function formatDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}