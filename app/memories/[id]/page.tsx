import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  Trash2,
  Undo2,
  BookmarkCheck,
} from "lucide-react";
import {
  getCourse,
  getStops,
  getPhotos,
  getReviews,
  getMembersMap,
} from "@/lib/data";
import { getSession } from "@/lib/auth";
import { formatTime } from "@/lib/format";
import { CourseHeader } from "@/components/CourseHeader";
import { Stars } from "@/components/Stars";
import { MemberBadge } from "@/components/MemberBadge";
import { deleteCourse } from "@/app/plans/actions";
import { deletePhoto, markPlanned } from "@/app/memories/actions";
import { ReviewForm } from "./review-form";
import { PhotoUploader } from "./photos";

export const dynamic = "force-dynamic";

export default async function MemoryDetail({
  params,
}: {
  params: { id: string };
}) {
  const course = await getCourse(params.id);
  if (!course) notFound();
  if (course.status !== "done") redirect(`/plans/${course.id}`);

  const [stops, photos, reviews, members, session] = await Promise.all([
    getStops(course.id),
    getPhotos(course.id),
    getReviews(course.id),
    getMembersMap(),
    getSession(),
  ]);

  const myId = session?.memberId ?? "";
  const myReview = reviews.find((r) => r.author_id === myId) ?? null;
  const otherReviews = reviews.filter((r) => r.author_id !== myId);

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

      {/* 코스 요약 (읽기 전용) */}
      {stops.length > 0 && (
        <section className="mt-5 flex flex-col gap-1.5 rounded-md border border-border bg-surface p-4 shadow-soft">
          {stops.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-[13.5px]">
              <MapPin className="size-4 shrink-0 text-text-faint" strokeWidth={1.75} />
              <span className="font-semibold">{s.name}</span>
              {s.is_reserved && (
                <BookmarkCheck className="size-3.5 text-primary" strokeWidth={2} />
              )}
              <span className="tnum ml-auto font-bold text-text-sub">
                {formatTime(s.arrive_at)}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* 사진 */}
      <section className="mt-7">
        <h2 className="mb-3 text-[15px] font-extrabold">사진</h2>
        {photos.length > 0 && (
          <div className="mb-3 grid grid-cols-2 gap-2.5">
            {photos.map((p) => {
              const variant = p.author_id === myId ? "me" : "you";
              const authorName = p.author_id ? members[p.author_id]?.name : null;
              return (
                <div
                  key={p.id}
                  className="group relative overflow-hidden rounded-lg border border-border bg-surface-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={p.caption ?? "사진"}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                  {authorName && (
                    <div className="absolute left-1.5 top-1.5">
                      <MemberBadge name={authorName} variant={variant} />
                    </div>
                  )}
                  <form
                    action={deletePhoto}
                    className="absolute right-1.5 top-1.5"
                  >
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="course_id" value={course.id} />
                    <button
                      type="submit"
                      aria-label="사진 삭제"
                      className="grid size-7 place-items-center rounded-full bg-black/40 text-white backdrop-blur"
                    >
                      <Trash2 className="size-3.5" strokeWidth={2} />
                    </button>
                  </form>
                  {p.caption && (
                    <p className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/55 to-transparent px-2 pb-1.5 pt-4 text-[11px] font-semibold text-white">
                      {p.caption}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <PhotoUploader courseId={course.id} />
      </section>

      {/* 서로의 리뷰 */}
      <section className="mt-7">
        <h2 className="mb-1 text-[15px] font-extrabold">서로의 리뷰</h2>
        <p className="mb-3 text-[12.5px] text-text-sub">각자 별점과 한줄평을 남겨요.</p>

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
                    <p className="text-[13px] text-text-faint">한줄평이 아직 없어요</p>
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
    </main>
  );
}
