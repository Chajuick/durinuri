"use client";

import { MapPin, Trash2, BookmarkCheck } from "lucide-react";
import type { Photo, Stop, Member } from "@/lib/types";
import { formatTime } from "@/lib/format";
import { MemberBadge } from "@/components/MemberBadge";
import { deletePhoto, saveJourneyNote } from "@/app/memories/actions";
import { PhotoUploader } from "./photos";

export function JourneyMemory({
  stop,
  photos,
  members,
  myId,
  courseId,
}: {
  stop: Stop;
  photos: Photo[];
  members: Record<string, Member>;
  myId: string;
  courseId: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-soft">
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <MapPin className="size-4 shrink-0 text-primary" strokeWidth={1.75} />
          <span className="truncate text-[15px] font-extrabold">{stop.name}</span>
          {stop.is_reserved && (
            <BookmarkCheck className="size-3.5 shrink-0 text-primary" strokeWidth={2} />
          )}
        </div>
        {stop.arrive_at && (
          <span className="tnum text-[13px] font-bold text-text-sub">
            {formatTime(stop.arrive_at)}
          </span>
        )}
      </div>

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
                </div>
              );
            })}
          </div>
        )}

        <PhotoUploader courseId={courseId} stopId={stop.id} compact />

        <form action={saveJourneyNote} className="mt-3">
          <input type="hidden" name="stop_id" value={stop.id} />
          <input type="hidden" name="course_id" value={courseId} />
          <textarea
            name="memo"
            defaultValue={stop.memo ?? ""}
            rows={2}
            maxLength={200}
            placeholder="이 여정에 한마디…"
            className="w-full resize-none rounded-sm border border-border bg-bg px-3 py-2.5 text-[13.5px] outline-none focus:border-primary"
          />
          <div className="mt-1.5 flex justify-end">
            <button
              type="submit"
              className="rounded-sm bg-surface-2 px-4 py-1.5 text-[12px] font-bold text-text-sub"
            >
              한마디 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
