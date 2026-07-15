import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  type LucideIcon,
} from "lucide-react";
import type { DayWeather } from "@/lib/weather";

function weatherInfo(code: number): { Icon: LucideIcon; label: string } {
  if (code === 0) return { Icon: Sun, label: "맑음" };
  if (code <= 2) return { Icon: CloudSun, label: "구름 조금" };
  if (code === 3) return { Icon: Cloud, label: "흐림" };
  if (code <= 48) return { Icon: CloudFog, label: "안개" };
  if (code <= 57) return { Icon: CloudDrizzle, label: "이슬비" };
  if (code <= 67) return { Icon: CloudRain, label: "비" };
  if (code <= 77) return { Icon: CloudSnow, label: "눈" };
  if (code <= 82) return { Icon: CloudRain, label: "소나기" };
  if (code <= 86) return { Icon: CloudSnow, label: "소나기눈" };
  return { Icon: CloudLightning, label: "뇌우" };
}

export function WeatherChip({ weather }: { weather: DayWeather }) {
  const { Icon, label } = weatherInfo(weather.code);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[11.5px] font-bold text-text-sub">
      <Icon className="size-3.5 text-primary" strokeWidth={1.75} />
      <span>{label}</span>
      <span className="tnum text-text">
        {Math.round(weather.tmax)}° / {Math.round(weather.tmin)}°
      </span>
    </span>
  );
}
