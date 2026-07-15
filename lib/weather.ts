import "server-only";

export interface DayWeather {
  tmax: number;
  tmin: number;
  code: number;
}

const REVALIDATE = 60 * 60 * 3; // 3시간

async function fetchDaily(
  base: string,
  lat: number,
  lng: number,
  date: string,
): Promise<DayWeather | null> {
  try {
    const url =
      `${base}?latitude=${lat}&longitude=${lng}` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
      `&timezone=Asia%2FSeoul&start_date=${date}&end_date=${date}`;
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) return null;
    const j = await res.json();
    const tmax = j?.daily?.temperature_2m_max?.[0];
    const tmin = j?.daily?.temperature_2m_min?.[0];
    const code = j?.daily?.weather_code?.[0];
    if (tmax == null || tmin == null) return null;
    return { tmax, tmin, code: code ?? 0 };
  } catch {
    return null;
  }
}

/**
 * 특정 위치·날짜의 일별 날씨(최고/최저 기온 + 날씨코드).
 * 예보 범위(과거 92일 ~ 미래 16일)는 forecast, 그 외 과거는 archive 사용.
 * Open-Meteo는 무료·API키 불필요.
 */
export async function getDayWeather(
  lat: number,
  lng: number,
  date: string | null,
): Promise<DayWeather | null> {
  if (!date) return null;
  // 우선 예보 API, 없으면 과거 아카이브 API
  const forecast = await fetchDaily(
    "https://api.open-meteo.com/v1/forecast",
    lat,
    lng,
    date,
  );
  if (forecast) return forecast;
  return fetchDaily(
    "https://archive-api.open-meteo.com/v1/archive",
    lat,
    lng,
    date,
  );
}
