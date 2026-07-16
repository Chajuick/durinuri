import { MapPin } from "lucide-react";
import type { Photo, Stop, StopReview, Review, Member } from "@/lib/types";
import { formatTime } from "@/lib/format";
import { Stars } from "@/components/Stars";
import { MemberBadge } from "@/components/MemberBadge";
import { NaverMapLink } from "@/components/NaverMapLink";
import { DayHeader } from "@/components/DayHeader";
import { WeatherChip } from "@/components/WeatherChip";
import type { DayWeather } from "@/lib/weather";

/** 살짝 기울인 각도 — 인덱스 기반(서버/클라 일치) */
const TILT = [-3, 2, -1.5, 3, -2, 1.5, -2.5, 1];

/** 빨랫줄에 걸린 폴라로이드 한 장 (캡션만 손글씨) */
function Polaroid({
  photo,
  variant,
  i,
}: {
  photo: Photo;
  variant: "me" | "you";
  i: number;
}) {
  const pegColor = variant === "me" ? "var(--primary)" : "var(--you-ink)";
  return (
    <figure
      className="relative mt-2 w-[45%] max-w-[168px] shrink-0 rounded-[3px] bg-[#fffdf7] p-2 pb-1 shadow-[0_8px_18px_rgba(43,42,40,0.16)]"
      style={{ transform: `rotate(${TILT[i % TILT.length]}deg)` }}
    >
      {/* 집게 (색으로 올린 사람 구분) */}
      <span
        className="absolute -top-3 left-1/2 h-4 w-2.5 -translate-x-1/2 rounded-[2px] shadow-[0_2px_3px_rgba(0,0,0,0.25)]"
        style={{ background: pegColor }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={photo.caption ?? ""}
        className="aspect-square w-full rounded-[1px] object-cover"
        loading="lazy"
      />
      {photo.caption && (
        <figcaption className="px-0.5 pt-1 text-center font-hand text-[18px] leading-tight text-[#4a4038]">
          {photo.caption}
        </figcaption>
      )}
    </figure>
  );
}

/** 여러 장을 줄에 널기 */
function Clothesline({ photos, myId }: { photos: Photo[]; myId: string }) {
  if (photos.length === 0) return null;
  return (
    <div className="relative px-1 pt-3">
      {/* 줄 */}
      <div className="pointer-events-none absolute inset-x-0 top-2 h-px bg-gradient-to-r from-transparent via-[#c9a06d] to-transparent" />
      <div className="flex flex-wrap items-start justify-center gap-x-3 gap-y-5">
        {photos.map((p, i) => (
          <Polaroid
            key={p.id}
            photo={p}
            variant={p.author_id === myId ? "me" : "you"}
            i={i}
          />
        ))}
      </div>
    </div>
  );
}

function JourneyCard({
  stop,
  photos,
  reviews,
  members,
  myId,
}: {
  stop: Stop;
  photos: Photo[];
  reviews: StopReview[];
  members: Record<string, Member>;
  myId: string;
}) {
  const comments = reviews.filter((r) => r.comment && r.comment.trim());
  const empty = photos.length === 0 && comments.length === 0;

  return (
    <div className="rounded-lg border border-border bg-surface px-4 pb-4 pt-3.5 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <MapPin className="size-4 shrink-0 text-primary" strokeWidth={1.75} />
          <span className="truncate text-[15px] font-extrabold">{stop.name}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {stop.arrive_at && (
            <span className="tnum text-[13px] font-bold text-text-sub">
              {formatTime(stop.arrive_at)}
            </span>
          )}
          <NaverMapLink query={stop.place_query || stop.name} />
        </div>
      </div>

      {empty ? (
        <p className="pt-3 text-center text-[13px] text-text-faint">
          아직 남긴 게 없어요
        </p>
      ) : (
        <>
          <Clothesline photos={photos} myId={myId} />
          {comments.length > 0 && (
            <div className="mt-4 flex flex-col gap-2.5 border-t border-border pt-3">
              {comments.map((r) => (
                <div key={r.id} className="flex flex-col gap-1">
                  <MemberBadge
                    name={members[r.author_id]?.name ?? "우리"}
                    variant={r.author_id === myId ? "me" : "you"}
                  />
                  <p className="text-[14px] leading-relaxed">{r.comment!.trim()}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function MemoryView({
  days,
  dayWeather,
  multiDay,
  photosByStop,
  reviewsByStop,
  orphanPhotos,
  reviews,
  members,
  myId,
}: {
  days: { date: string | null; stops: Stop[] }[];
  dayWeather: (DayWeather | null)[];
  multiDay: boolean;
  photosByStop: Map<string, Photo[]>;
  reviewsByStop: Map<string, StopReview[]>;
  orphanPhotos: Photo[];
  reviews: Review[];
  members: Record<string, Member>;
  myId: string;
}) {
  const hasStops = days.some((d) => d.stops.length > 0);
  const rated = reviews.filter((r) => r.rating || (r.one_line && r.one_line.trim()));

  return (
    <>
      {!multiDay && dayWeather[0] && (
        <div className="mt-3">
          <WeatherChip weather={dayWeather[0]} />
        </div>
      )}

      <section className="mt-6 flex flex-col gap-8">
        {!hasStops && orphanPhotos.length === 0 && (
          <p className="rounded-md border border-dashed border-border bg-surface/60 px-4 py-8 text-center text-[13px] text-text-sub">
            아직 사진도 코멘트도 없어요.
            <br />
            편집에서 추억을 채워보자.
          </p>
        )}

        {days.map((day, di) => (
          <div key={day.date ?? "nodate"} className="flex flex-col gap-4">
            {multiDay && (
              <DayHeader
                date={day.date}
                right={
                  dayWeather[di] ? (
                    <WeatherChip weather={dayWeather[di]!} />
                  ) : undefined
                }
              />
            )}
            {day.stops.map((stop) => (
              <JourneyCard
                key={stop.id}
                stop={stop}
                photos={photosByStop.get(stop.id) ?? []}
                reviews={reviewsByStop.get(stop.id) ?? []}
                members={members}
                myId={myId}
              />
            ))}
          </div>
        ))}

        {orphanPhotos.length > 0 && (
          <div className="rounded-lg border border-border bg-surface px-4 pb-4 pt-3.5 shadow-soft">
            <span className="text-[13px] font-extrabold text-text-sub">
              그날의 사진들
            </span>
            <Clothesline photos={orphanPhotos} myId={myId} />
          </div>
        )}
      </section>

      {/* 서로의 리뷰 (총평) */}
      {rated.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-[15px] font-extrabold">서로의 리뷰</h2>
          <div className="flex flex-col gap-3">
            {rated.map((r) => {
              const name = members[r.author_id]?.name ?? "우리";
              const variant = r.author_id === myId ? "me" : "you";
              return (
                <div
                  key={r.id}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 shadow-soft"
                >
                  <div className="flex items-center gap-2">
                    <MemberBadge name={name} variant={variant} />
                    <Stars value={r.rating} className="size-[17px]" />
                  </div>
                  {r.one_line && r.one_line.trim() ? (
                    <p className="text-[14px] leading-relaxed">{r.one_line.trim()}</p>
                  ) : (
                    <p className="text-[13px] text-text-faint">별점만 남겼어요</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
