"use client";

import { useState } from "react";
import { MapPin, BookmarkCheck, Pencil, Trash2, X } from "lucide-react";
import type { Stop } from "@/lib/types";
import { formatTime } from "@/lib/format";
import { updateStop, deleteStop } from "@/app/plans/actions";

export function StopRow({
  stop,
  courseId,
}: {
  stop: Stop;
  courseId: string;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-md border border-border bg-surface shadow-soft">
      {!editing ? (
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <MapPin className="size-4 shrink-0 text-text-faint" strokeWidth={1.75} />
            <span className="truncate text-[14.5px] font-bold">{stop.name}</span>
            {stop.is_reserved && (
              <BookmarkCheck className="size-4 shrink-0 text-primary" strokeWidth={2} />
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="tnum mr-1 text-[15px] font-extrabold">
              {formatTime(stop.arrive_at) || "--:--"}
            </span>
            <button
              onClick={() => setEditing(true)}
              aria-label="수정"
              className="grid size-7 place-items-center rounded-sm text-text-sub"
            >
              <Pencil className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      ) : (
        <form
          action={async (fd) => {
            await updateStop(fd);
            setEditing(false);
          }}
          className="flex flex-col gap-2.5 p-4"
        >
          <input type="hidden" name="id" value={stop.id} />
          <input type="hidden" name="course_id" value={courseId} />
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-text-sub">장소 수정</span>
            <button
              type="button"
              onClick={() => setEditing(false)}
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
                setEditing(false);
              }}
              className="grid h-10 w-11 place-items-center rounded-sm border border-border text-danger"
              aria-label="삭제"
            >
              <Trash2 className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function StopFields({ stop }: { stop?: Stop }) {
  return (
    <>
      <input
        name="name"
        required
        defaultValue={stop?.name ?? ""}
        placeholder="장소 이름 (예: 신당 오신돼지갈비)"
        className="h-11 rounded-sm border border-border bg-bg px-3 text-[14px] outline-none focus:border-primary"
      />
      <input
        name="place_query"
        defaultValue={stop?.place_query ?? ""}
        placeholder="지도 검색어 (비우면 이름으로 검색)"
        className="h-11 rounded-sm border border-border bg-bg px-3 text-[13px] outline-none focus:border-primary"
      />
      <div className="flex gap-2">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-[11.5px] font-semibold text-text-faint">도착 시각</span>
          <input
            name="arrive_at"
            type="time"
            defaultValue={formatTime(stop?.arrive_at ?? null)}
            className="h-11 rounded-sm border border-border bg-bg px-3 text-[14px] outline-none focus:border-primary"
          />
        </label>
        <label className="flex w-28 flex-col gap-1">
          <span className="text-[11.5px] font-semibold text-text-faint">머무는(분)</span>
          <input
            name="stay_min"
            type="number"
            min={0}
            defaultValue={stop?.stay_min ?? ""}
            placeholder="선택"
            className="h-11 rounded-sm border border-border bg-bg px-3 text-[14px] outline-none focus:border-primary"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-[13px] font-semibold text-text-sub">
        <input
          name="is_reserved"
          type="checkbox"
          defaultChecked={stop?.is_reserved ?? false}
          className="size-4 accent-[var(--primary)]"
        />
        예약함
      </label>
    </>
  );
}
