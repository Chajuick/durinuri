import { Car, TrainFront, Clock, CircleCheck, TriangleAlert } from "lucide-react";
import type { Segment, TravelLeg } from "@/lib/types";
import { formatMinutes } from "@/lib/format";

function SlackChip({ slack }: { slack: number | null }) {
  if (slack == null) return null;
  if (slack >= 0) {
    return (
      <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-ok-bg px-2 py-[3px] text-[11.5px] font-bold text-ok">
        <CircleCheck className="size-3.5" strokeWidth={2} />
        여유 {formatMinutes(slack)}
      </span>
    );
  }
  return (
    <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-danger-bg px-2 py-[3px] text-[11.5px] font-bold text-danger">
      <TriangleAlert className="size-3.5" strokeWidth={2} />
      {formatMinutes(slack)} 촉박
    </span>
  );
}

function Leg({ leg }: { leg: TravelLeg }) {
  const Icon = leg.mode === "car" ? Car : TrainFront;
  const label = leg.mode === "car" ? "차량" : "대중교통";
  return (
    <div className="flex items-center gap-2 text-[12.5px]">
      <span className="flex min-w-0 items-center gap-1.5 font-semibold text-text-sub">
        <Icon className="size-4 shrink-0" strokeWidth={1.75} />
        {label}{" "}
        {leg.minutes != null ? (
          <span className="tnum">약 {formatMinutes(leg.minutes)}</span>
        ) : (
          <span className="text-text-faint">계산 안 됨</span>
        )}
        {leg.mode === "transit" && leg.transfers != null && leg.transfers > 0 && (
          <span className="tnum text-text-faint">· 환승 {leg.transfers}회</span>
        )}
      </span>
      <SlackChip slack={leg.slackMinutes} />
    </div>
  );
}

export function TravelBlock({ segment }: { segment: Segment }) {
  const noCoords = segment.legs.every((l) => l.minutes == null);
  return (
    <div className="ml-[22px] flex flex-col gap-2 border-l-2 border-dashed border-border py-3 pl-5">
      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-text-sub">
        <Clock className="size-3.5" strokeWidth={1.75} />
        다음까지{" "}
        <span className="tnum">
          {segment.gapMinutes != null ? formatMinutes(segment.gapMinutes) : "-"}
        </span>
      </div>
      {segment.legs.map((leg) => (
        <Leg key={leg.mode} leg={leg} />
      ))}
      {noCoords && (
        <p className="text-[11px] text-text-faint">
          장소를 검색해 좌표가 잡히면 이동시간이 표시돼요
        </p>
      )}
    </div>
  );
}
