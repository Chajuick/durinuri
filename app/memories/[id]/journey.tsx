"use client";

import { useState } from "react";
import { MapPin, Trash2, BookmarkCheck, Pencil, X } from "lucide-react";
import type { Photo, Stop, StopReview, Member } from "@/lib/types";
import { formatTime } from "@/lib/format";
import { MemberBadge } from "@/components/MemberBadge";
import { deletePhoto, saveStopReview } from "@/app/memories/actions";
import { updateStop, deleteStop } from "@/app/plans/actions";
import { StopFields } from "@/app/plans/[id]/stop-row";
import { NaverMapLink } from "@/components/NaverMapLink";
import { PhotoUploader } from "./photos";
import { PhotoCaption } from "./photo-caption";

export function JourneyMemory({
  stop,
  photos,
  reviews,
  members,
  myId,
  courseId,
}: {
  stop: Stop;
  photos: Photo[];
  reviews: StopReview[];
  members: Record<string, Member>;
  myId: string;
  courseId: string;
}) {
  const myReview = reviews.find((r) => r.author_id === myId) ?? null;
  const otherReviews = reviews.filter((r) => r.author_id !== myId);
  const myName = members[myId]?.name ?? "나";
  const [editingStop, setEditingStop] = useState(false);
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-soft">
      {editingStop ? (
        <form
          action={async (fd) => {
            await updateStop(fd);
            setEditingStop(false);
          }}
          className="flex flex-col gap-2.5 border-b border-border p-4"
        >
          <input type="hidden" name="id" value={stop.id} />
          <input type="hidden" name="course_id" value={courseId} />
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-text-sub">여정 수정</span>
            <button
              type="button"
              onClick={() => setEditingStop(false)}
              aria-label="닫기"
              className="text-text-faint"
            >
              <X className="size-4" strokeWidth={2} />
            </button>
          </div>
          <StopFields stop={stop} />
          <div className="mt-1 flex items-center gap-2">
            <button
              type="submit"
              className="h-10 flex-1 rounded-sm bg-primary text-sm font-bold text-white shadow-soft"
            >
              저장
            </button>
            <button
              type="submit"
              formAction={async (fd) => {
                await deleteStop(fd);
                setEditingStop(false);
              }}
              className="grid h-10 w-11 place-items-center rounded-sm border border-border text-danger"
              aria-label="여정 삭제"
            >
              <Trash2 className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between gap-2 px-4 pt-4">
          <div className="flex min-w-0 items-center gap-2">
            <MapPin className="size-4 shrink-0 text-primary" strokeWidth={1.75} />
            <span className="truncate text-[15px] font-extrabold">{stop.name}</span>
            {stop.is_reserved && (
              <BookmarkCheck className="size-3.5 shrink-0 text-primary" strokeWidth={2} />
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {stop.arrive_at && (
              <span className="tnum mr-0.5 text-[13px] font-bold text-text-sub">
                {formatTime(stop.arrive_at)}
              </span>
            )}
            <NaverMapLink query={stop.place_query || stop.name} />
            <button
              type="button"
              onClick={() => setEditingStop(true)}
              aria-label="여정 수정"
              className="grid size-7 place-items-center rounded-sm text-text-sub"
            >
              <Pencil className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}

      <div className="p-4 pt-3">
        {photos.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2">
            {photos.map((p) => {
              const variant = p.author_id === myId ? "me" : "you";
              const authorName = p.author_id ? members[p.author_id]?.name : null;
              return (
                <div
                  key={p.id}
                  className="relative overflow-hidden rounded-md border border-border bg-surface-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={p.caption ?? stop.name}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                  {authorName && (
                    <div className="absolute left-1 top-1 scale-90 origin-top-left">
                      <MemberBadge name={authorName} variant={variant} />
                    </div>
                  )}
                  <form
                    action={deletePhoto}
                    className="absolute right-1 top-1"
                  >
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="course_id" value={courseId} />
                    <button
                      type="submit"
                      aria-label="사진 삭제"
                      className="grid size-6 place-items-center rounded-full bg-black/45 text-white backdrop-blur"
                    >
                      <Trash2 className="size-3" strokeWidth={2} />
                    </button>
                  </form>
                  <div className="border-t border-border">
                    <PhotoCaption
                      photoId={p.id}
                      courseId={courseId}
                      initial={p.caption}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <PhotoUploader courseId={courseId} stopId={stop.id} compact />

        {/* 여정별 코멘트 — 서로 각자 한마디 */}
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
          {/* 내 코멘트 (편집) */}
          <form action={saveStopReview}>
            <input type="hidden" name="stop_id" value={stop.id} />
            <input type="hidden" name="course_id" value={courseId} />
            <div className="mb-1.5 flex items-center gap-2">
              <MemberBadge name={myName} variant="me" />
              <span className="text-[12px] text-text-faint">내 코멘트</span>
            </div>
            <textarea
              key={myReview?.updated_at ?? "new"}
              name="comment"
              defaultValue={myReview?.comment ?? ""}
              rows={2}
              maxLength={300}
              placeholder="이 여정 어땠어? 코멘트를 남겨줘…"
              className="w-full resize-none rounded-sm border border-border bg-bg px-3 py-2.5 text-[13.5px] outline-none focus:border-primary"
            />
            <div className="mt-1.5 flex justify-end">
              <button
                type="submit"
                className="rounded-sm bg-surface-2 px-4 py-1.5 text-[12px] font-bold text-text-sub"
              >
                코멘트 저장
              </button>
            </div>
          </form>

          {/* 상대 코멘트 (읽기 전용) */}
          {otherReviews.map((r) => {
            const name = members[r.author_id]?.name ?? "상대";
            return (
              <div key={r.id}>
                <div className="mb-1.5 flex items-center gap-2">
                  <MemberBadge name={name} variant="you" />
                  <span className="text-[12px] text-text-faint">상대 코멘트</span>
                </div>
                <div className="rounded-sm border border-border bg-bg px-3 py-2.5 text-[13.5px] leading-relaxed">
                  {r.comment ? (
                    r.comment
                  ) : (
                    <span className="text-text-faint">아직 코멘트가 없어요</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
