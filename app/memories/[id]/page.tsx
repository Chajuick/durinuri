import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Trash2, Undo2, Images } from "lucide-react";
import {
  getCourse,
  getStops,
  getPhotos,
  getReviews,
  getStopReviews,
  getMembersMap,
} from "@/lib/data";
import { getSession } from "@/lib/auth";
import { ensureCoords } from "@/lib/geo/backfill";
import { groupStopsByDay } from "@/lib/stops";
import type { Photo, StopReview } from "@/lib/types";
import { CourseHeader } from "@/components/CourseHeader";
import { DayHeader } from "@/components/DayHeader";
import { WeatherChip } from "@/components/WeatherChip";
import { getDayWeather } from "@/lib/weather";
import { Stars } from "@/components/Stars";
import { MemberBadge } from "@/components/MemberBadge";
import { deleteCourse } from "@/app/plans/actions";
import { deletePhoto, markPlanned } from "@/app/memories/actions";
import { ReviewForm } from "./review-form";
import { JourneyMemory } from "./journey";
import { PhotoUploader } from "./photos";
import { MemoryView } from "./view";
import { ViewEditToggle } from "./view-edit-toggle";
import { AddStop } from "@/app/plans/[id]/add-stop";

export const dynamic = "force-dynamic";

export default async function MemoryDetail({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { edit?: string };
}) {
  const editing = searchParams?.edit === "1";
  const course = await getCourse(params.id);
  if (!course) notFound();
  if (course.status !== "done") redirect(`/plans/${course.id}`);

  const stops = await ensureCoords(await getStops(course.id));
  const [photos, reviews, stopReviews, members, session] = await Promise.all([
    getPhotos(course.id),
    getReviews(course.id),
    getStopReviews(course.id),
    getMembersMap(),
    getSession(),
  ]);

  const myId = session?.memberId ?? "";
  const myReview = reviews.find((r) => r.author_id === myId) ?? null;
  const otherReviews = reviews.filter((r) => r.author_id !== myId);

  const days = groupStopsByDay(stops, course.date);
  const multiDay = days.length > 1;
  const dayWeather = await Promise.all(
    days.map((d) => {
      const c = d.stops.find((s) => s.lat != null && s.lng != null);
      return c ? getDayWeather(c.lat!, c.lng!, d.date) : Promise.resolve(null);
    }),
  );

  const photosByStop = new Map<string, Photo[]>();
  const orphanPhotos: Photo[] = [];
  for (const p of photos) {
    if (p.stop_id) {
      const arr = photosByStop.get(p.stop_id) ?? [];
      arr.push(p);
      photosByStop.set(p.stop_id, arr);
    } else {
      orphanPhotos.push(p);
    }
  }

  const reviewsByStop = new Map<string, StopReview[]>();
  for (const r of stopReviews) {
    const arr = reviewsByStop.get(r.stop_id) ?? [];
    arr.push(r);
    reviewsByStop.set(r.stop_id, arr);
  }

  return (
    <main className="mx-auto max-w-md px-5 pb-24 pt-6">
      <Link
        href="/memories"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-text-sub"
      >
        <ChevronLeft className="size-4" strokeWidth={2} />
        간 데이트
      </Link>

      <CourseHeader id={course.id} title={course.title} date={course.date} />

      <div className="mt-4">
        <ViewEditToggle editing={editing} />
      </div>

      {!editing ? (
        <MemoryView
          days={days}
          dayWeather={dayWeather}
          multiDay={multiDay}
          photosByStop={photosByStop}
          reviewsByStop={reviewsByStop}
          orphanPhotos={orphanPhotos}
          reviews={reviews}
          members={members}
          myId={myId}
        />
      ) : (
        <>
      {!multiDay && dayWeather[0] && (
        <div className="mt-3">
          <WeatherChip weather={dayWeather[0]} />
        </div>
      )}

      {/* 여정별 추억 */}
      <section className="mt-6">
        {stops.length === 0 && (
          <p className="mb-3 rounded-md border border-dashed border-border bg-surface/60 px-4 py-6 text-center text-[13px] text-text-sub">
            아직 여정이 없어요. 아래에서 장소(여정)를 추가하면
            여정마다 사진·코멘트를 남길 수 있어요.
          </p>
        )}
        {days.map((day, di) => (
          <div key={day.date ?? "nodate"} className={di > 0 ? "mt-9" : ""}>
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
            <div className="mb-3 flex flex-col gap-3">
              {day.stops.map((stop) => (
                <JourneyMemory
                  key={stop.id}
                  stop={stop}
                  photos={photosByStop.get(stop.id) ?? []}
                  reviews={reviewsByStop.get(stop.id) ?? []}
                  members={members}
                  myId={myId}
                  courseId={course.id}
                />
              ))}
            </div>
          </div>
        ))}
        <AddStop courseId={course.id} courseDate={course.date} />
      </section>

      {/* 여정 없이 올린 사진 (예전 사진 또는 여정 없는 데이트) */}
      {(orphanPhotos.length > 0 || stops.length === 0) && (
        <section className="mt-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-[14px] font-extrabold text-text-sub">
            <Images className="size-4" strokeWidth={1.75} />
            여정 없이 올린 사진
          </h2>
          {orphanPhotos.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-2">
              {orphanPhotos.map((p) => {
                const variant = p.author_id === myId ? "me" : "you";
                const authorName = p.author_id
                  ? members[p.author_id]?.name
                  : null;
                return (
                  <div
                    key={p.id}
                    className="relative overflow-hidden rounded-md border border-border bg-surface-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={p.caption ?? "사진"}
                      className="aspect-square w-full object-cover"
                      loading="lazy"
                    />
                    {authorName && (
                      <div className="absolute left-1 top-1 origin-top-left scale-90">
                        <MemberBadge name={authorName} variant={variant} />
                      </div>
                    )}
                    <form action={deletePhoto} className="absolute right-1 top-1">
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="course_id" value={course.id} />
                      <button
                        type="submit"
                        aria-label="사진 삭제"
                        className="grid size-6 place-items-center rounded-full bg-black/45 text-white backdrop-blur"
                      >
                        <Trash2 className="size-3" strokeWidth={2} />
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
          <PhotoUploader courseId={course.id} />
        </section>
      )}

      {/* 서로의 리뷰 */}
      <section className="mt-7">
        <h2 className="mb-1 text-[15px] font-extrabold">서로의 리뷰</h2>
        <p className="mb-3 text-[12.5px] text-text-sub">
          데이트 전체에 각자 별점과 한줄평을 남겨요.
        </p>

        <div className="flex flex-col gap-3">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <MemberBadge name={session?.name ?? "나"} variant="me" />
              <span className="text-[12px] text-text-faint">내 리뷰</span>
            </div>
            <ReviewForm
              courseId={course.id}
              initialRating={myReview?.rating ?? null}
              initialOneLine={myReview?.one_line ?? null}
            />
          </div>

          {otherReviews.map((r) => {
            const name = members[r.author_id]?.name ?? "상대";
            return (
              <div key={r.id}>
                <div className="mb-1.5 flex items-center gap-2">
                  <MemberBadge name={name} variant="you" />
                  <span className="text-[12px] text-text-faint">상대 리뷰</span>
                </div>
                <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 shadow-soft">
                  <Stars value={r.rating} className="size-[18px]" />
                  {r.one_line ? (
                    <p className="text-[14px] leading-relaxed">{r.one_line}</p>
                  ) : (
                    <p className="text-[13px] text-text-faint">
                      한줄평이 아직 없어요
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 액션 */}
      <div className="mt-8 flex flex-col gap-2.5">
        <form action={markPlanned}>
          <input type="hidden" name="id" value={course.id} />
          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-sm border border-border bg-surface text-[13px] font-bold text-text-sub"
          >
            <Undo2 className="size-4" strokeWidth={1.75} />
            다시 갈 데이트로
          </button>
        </form>
        <form action={deleteCourse}>
          <input type="hidden" name="id" value={course.id} />
          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-sm border border-border bg-surface text-[13px] font-bold text-danger"
          >
            <Trash2 className="size-4" strokeWidth={1.75} />이 추억 삭제
          </button>
        </form>
      </div>
        </>
      )}
    </main>
  );
}
