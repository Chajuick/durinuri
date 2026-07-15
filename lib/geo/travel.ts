import "server-only";
import type { Stop, Segment, TravelLeg } from "@/lib/types";
import { timeToMinutes, sortStops, effectiveDate } from "@/lib/stops";
import { carDurationMin, type Coord } from "./kakao";
import { transitDuration } from "./odsay";

function coordOf(s: Stop): Coord | null {
  if (s.lat == null || s.lng == null) return null;
  return { lat: s.lat, lng: s.lng };
}

/**
 * 연속한 두 장소 사이의 구간별 이동정보 계산.
 * 같은 날의 인접 여정끼리만 계산(날이 바뀌면 이동블록 생략).
 */
export async function buildSegments(
  stops: Stop[],
  courseDate: string | null = null,
): Promise<Segment[]> {
  const ordered = sortStops(stops, courseDate);
  const pairs = ordered
    .slice(0, -1)
    .map((from, i) => ({ from, to: ordered[i + 1] }))
    .filter(
      ({ from, to }) =>
        effectiveDate(from, courseDate) === effectiveDate(to, courseDate),
    );

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
