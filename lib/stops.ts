import type { Stop } from "./types";

/** "HH:MM[:SS]" → 자정 이후 분. 없으면 null */
export function timeToMinutes(t: string | null): number | null {
  if (!t) return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(t);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** 여정의 표시용 날짜(없으면 코스 날짜) */
export function effectiveDate(
  stop: Stop,
  courseDate: string | null,
): string | null {
  return stop.date ?? courseDate;
}

/** 여정의 실제 시각(분, 절대값). 날짜+시간 합산 */
export function stopDateTime(
  stop: Stop,
  courseDate: string | null,
): number | null {
  const t = timeToMinutes(stop.arrive_at);
  const d = effectiveDate(stop, courseDate);
  if (!d) return t;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  if (!m) return t;
  const base = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / 60000;
  return base + (t ?? 0);
}

/** 여정을 날짜+시간순으로 정렬 */
export function sortStops(stops: Stop[], courseDate: string | null): Stop[] {
  return [...stops].sort((a, b) => {
    const da = stopDateTime(a, courseDate);
    const db = stopDateTime(b, courseDate);
    if (da == null && db == null) return a.sort_order - b.sort_order;
    if (da == null) return 1;
    if (db == null) return -1;
    return da - db;
  });
}

/** 날짜별로 여정을 묶음(정렬 포함) */
export function groupStopsByDay(
  stops: Stop[],
  courseDate: string | null,
): { date: string | null; stops: Stop[] }[] {
  const ordered = sortStops(stops, courseDate);
  const groups: { date: string | null; stops: Stop[] }[] = [];
  for (const s of ordered) {
    const d = effectiveDate(s, courseDate);
    const last = groups[groups.length - 1];
    if (last && last.date === d) last.stops.push(s);
    else groups.push({ date: d, stops: [s] });
  }
  return groups;
}
