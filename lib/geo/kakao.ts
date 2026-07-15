import "server-only";

export interface Coord {
  lat: number;
  lng: number;
}

const DAY = 60 * 60 * 24;

/** 장소명 → 좌표 (카카오 키워드 검색). 결과 없으면 null */
export async function geocodePlace(query: string): Promise<Coord | null> {
  const key = process.env.KAKAO_REST_KEY;
  if (!key || !query.trim()) return null;

  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
        query,
      )}&size=1`,
      {
        headers: { Authorization: `KakaoAK ${key}` },
        next: { revalidate: DAY * 7 },
      },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const doc = json?.documents?.[0];
    if (!doc) return null;
    const lat = Number(doc.y);
    const lng = Number(doc.x);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

/** 자동차 소요시간(분). 카카오모빌리티 길찾기. 실패 시 null */
export async function carDurationMin(
  from: Coord,
  to: Coord,
): Promise<number | null> {
  const key = process.env.KAKAO_REST_KEY;
  if (!key) return null;

  try {
    const url =
      `https://apis-navi.kakaomobility.com/v1/directions` +
      `?origin=${from.lng},${from.lat}` +
      `&destination=${to.lng},${to.lat}` +
      `&priority=RECOMMEND`;
    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${key}` },
      next: { revalidate: DAY },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const seconds = json?.routes?.[0]?.summary?.duration;
    if (typeof seconds !== "number") return null;
    return Math.round(seconds / 60);
  } catch {
    return null;
  }
}
