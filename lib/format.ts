// 표시용 포매터 (클라이언트/서버 공용)

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** "16:00:00" → "16:00" */
export function formatTime(t: string | null): string {
  if (!t) return "";
  const m = /^(\d{1,2}):(\d{2})/.exec(t);
  if (!m) return t;
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

/** 분 → "1시간 35분" / "45분" / "1시간" */
export function formatMinutes(min: number | null | undefined): string {
  if (min == null) return "-";
  const abs = Math.abs(Math.round(min));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

/** "2026-07-17" → "7월 17일 (금)" */
export function formatDate(d: string | null): string {
  if (!d) return "날짜 미정";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  if (!m) return d;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const wd = WEEKDAYS[date.getDay()];
  return `${Number(m[2])}월 ${Number(m[3])}일 (${wd})`;
}
