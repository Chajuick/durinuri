"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { addStop } from "@/app/plans/actions";
import { StopFields } from "./stop-row";

export function AddStop({ courseId }: { courseId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-surface/60 py-3.5 text-sm font-bold text-primary-ink"
      >
        <Plus className="size-4" strokeWidth={2.25} />
        장소 추가
      </button>
    );
  }

  return (
    <form
      action={async (fd) => {
        await addStop(fd);
        setOpen(false);
      }}
      className="flex flex-col gap-2.5 rounded-md border border-border bg-surface p-4 shadow-soft"
    >
      <input type="hidden" name="course_id" value={courseId} />
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold text-text-sub">장소 추가</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="닫기"
          className="text-text-faint"
        >
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>
      <StopFields />
      <button
        type="submit"
        className="mt-1 h-10 rounded-sm bg-primary text-sm font-bold text-white shadow-soft"
      >
        추가하기
      </button>
    </form>
  );
}
