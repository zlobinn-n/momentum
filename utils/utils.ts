import { MONTH_NAMES, WEEK_DAYS } from './constants';

export function formatDateReadable(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()];
  const weekDay = WEEK_DAYS[d.getDay()];
  return `${day} ${month}, ${weekDay}`;
}

export function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function todayDateString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function genDays(startOffset = 0, count = 30) {
  return Array.from({ length: count }, (_, i) => ({
    date: todayDateString(startOffset + i),
  }));
}

export function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map((x) => Number(x));
  return h * 60 + m;
}

export function minutesToTime(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${pad(h)}:${pad(m)}`;
}

export function dateToString(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function timeToString(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function isToday(dateStr: string) {
  return dateStr === todayDateString();
}