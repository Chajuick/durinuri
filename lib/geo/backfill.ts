import "server-only";
import { getAdmin } from "@/lib/supabase/admin";
import { geocodePlace } from "./kakao";
import type { Stop } from "@/lib/types";

/**
 * 좌표(lat/lng)가 없는 장소를 카카오 지오코딩으로 채워 DB에 저장하고,
 * 좌표가 채워진 stops 배열을 반환한다.
 * (카카오 키가 없으면 그대로 반환 — 이동시간은 "계산 안 됨"으로 표시)
 */
export async function ensureCoords(stops: Stop[]): Promise<Stop[]> {
  const missing = stops.filter(
    (s) => (s.lat == null || s.lng == null) && (s.place_query || s.name),
  );
  if (missing.length === 0) return stops;

  const admin = getAdmin();
  const updated = new Map<string, { lat: number; lng: number }>();

  await Promise.all(
    missing.map(async (s) => {
      const coord = await geocodePlace(s.place_query || s.name);
      if (coord) {
        updated.set(s.id, coord);
        await admin
          .from("stops")
          .update({ lat: coord.lat, lng: coord.lng })
          .eq("id", s.id);
      }
    }),
  );

  if (updated.size === 0) return stops;
  return stops.map((s) =>
    updated.has(s.id) ? { ...s, ...updated.get(s.id)! } : s,
  );
}
