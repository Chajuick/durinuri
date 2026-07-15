import "server-only";
import type { Stop, Segment, TravelLeg } from "@/lib/types";
import { carDurationMin, type Coord } from "./kakao";
import { transitDuration } from "./odsay";

/** "HH:MM[:SS]" → 자정 이후 분. 없으면 null */
export function timeToMinutes(t: string | null): number | null {
  if (!t) return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(t);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function coordOf(s: Stop): Coord | null {
  if (s.lat == null || s.lng == null) return null;
  return { lat: s.lat, lng: s.lng };
}

/** 연속한 두 장소 사이의 구간별 이동정보 계산 */
export async function buildSegments(stops: Stop[]): Promise<Segment[]> {
  // 시간순 정렬(도착시각 우선, 없으면 입력순) — 표시 순서와 일치
  const ordered = [...stops].sort((a, b) => {
    const ta = timeToMinutes(a.arrive_at);
    const tb = timeToMinutes(b.arrive_at);
    if (ta == null && tb == null) return a.sort_order - b.sort_order;
    if (ta == null) return 1;
    if (tb == null) return -1;
    return ta - tb;
  });
  const pairs = ordered.slice(0, -1).map((from, i) => ({ from, to: ordered[i + 1] }));

  return Promise.all(
    pairs.map(async ({ from, to }): Promise<Segment> => {
      const fromMin = timeToMinutes(from.arrive_at);
      const toMin = timeToMinutes(to.arrive_at);
      const gapMinutes =
        fromMin != null && toMin != null ? toMin - fromMin : null;

      const fc = coordOf(from);
      const tc = coordOf(to);
      const stay = from.stay_min ?? 0;

      const slackFor = (travel: number | null): number | null => {
        if (gapMinutes == null || travel == null) return null;
        return gapMinutes - travel - stay;
      };

      let legs: TravelLeg[] = [
        { mode: "car", minutes: null, slackMinutes: null },
        { mode: "transit", minutes: null, slackMinutes: null },
      ];

      if (fc && tc) {
        const [car, transit] = await Promise.all([
          carDurationMin(fc, tc),
          transitDuration(fc, tc),
        ]);
        legs = [
          { mode: "car", minutes: car, slackMinutes: slackFor(car) },
          {
            mode: "transit",
            minutes: transit?.minutes ?? null,
            transfers: transit?.transfers ?? null,
            slackMinutes: slackFor(transit?.minutes ?? null),
          },
        ];
      }

      return {
        fromStopId: from.id,
        toStopId: to.id,
        gapMinutes,
        legs,
      };
    }),
  );
}
