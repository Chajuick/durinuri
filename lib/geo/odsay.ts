import "server-only";
import type { Coord } from "./kakao";

const DAY = 60 * 60 * 24;

export interface TransitResult {
  minutes: number;
  transfers: number | null; // 환승 횟수 (버스+지하철)
}

/**
 * 대중교통 소요시간(분) — ODsay 대중교통 길찾기.
 * ODsay는 도어투도어 totalTime(분, 도보 포함)을 제공. 실패 시 null.
 */
export async function transitDuration(
  from: Coord,
  to: Coord,
): Promise<TransitResult | null> {
  const key = process.env.ODSAY_KEY;
  if (!key) return null;

  try {
    const url =
      `https://api.odsay.com/v1/api/searchPubTransPathT` +
      `?apiKey=${encodeURIComponent(key)}` +
      `&SX=${from.lng}&SY=${from.lat}&EX=${to.lng}&EY=${to.lat}`;
    // ODsay는 등록된 도메인의 Referer를 검사한다. 서버 호출엔 직접 붙여준다.
    const referer =
      process.env.ODSAY_REFERER || "https://durinuri.vercel.app";
    const res = await fetch(url, {
      headers: { Referer: referer },
      next: { revalidate: DAY },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const info = json?.result?.path?.[0]?.info;
    if (!info || typeof info.totalTime !== "number") return null;
    const transfers =
      (info.busTransitCount ?? 0) + (info.subwayTransitCount ?? 0) - 1;
    return {
      minutes: Math.round(info.totalTime),
      transfers: transfers >= 0 ? transfers : null,
    };
  } catch {
    return null;
  }
}
