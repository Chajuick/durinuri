"use client";

import { useState } from "react";
import { Pencil, Check, X, Clock } from "lucide-react";
import { updateCourse } from "@/app/plans/actions";
import { formatDate, withIga } from "@/lib/format";

export function CourseHeader({
  id,
  title,
  date,
  editorName,
}: {
  id: string;
  title: string;
  date: string | null;
  editorName?: string | null;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form
        action={async (fd) => {
          await updateCourse(fd);
          setEditing(false);
        }}
        className="flex flex-col gap-2.5 rounded-md border border-border bg-surface p-4 shadow-soft"
      >
        <input type="hidden" name="id" value={id} />
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-text-sub">데이트 수정</span>
          <button
            type="button"
            onClick={() => setEditing(false)}
            aria-label="닫기"
            className="text-text-faint"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-[11.5px] font-semibold text-text-faint">이름</span>
          <input
            name="title"
            required
            maxLength={40}
            defaultValue={title}
            placeholder="데이트 이름"
            className="h-11 rounded-sm border border-border bg-bg px-3 text-[15px] font-bold outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11.5px] font-semibold text-text-faint">날짜</span>
          <input
            name="date"
            type="date"
            defaultValue={date ?? ""}
            className="h-11 rounded-sm border border-border bg-bg px-3 text-[14px] outline-none focus:border-primary"
          />
        </label>
        <button
          type="submit"
          className="mt-1 flex h-10 items-center justify-center gap-1.5 rounded-sm bg-primary text-sm font-bold text-white shadow-soft"
        >
          <Check className="size-4" strokeWidth={2.25} />
          저장
        </button>
      </form>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <h1 className="text-[22px] font-extrabold leading-tight tracking-tight">
          {title}
        </h1>
        <button
          onClick={() => setEditing(true)}
          aria-label="데이트 이름·날짜 수정"
          className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-sm text-text-sub"
        >
          <Pencil className="size-4" strokeWidth={1.75} />
        </button>
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-[13px] text-text-sub">
        <span className="tnum">{formatDate(date)}</span>
        {editorName && (
          <>
            <span className="text-text-faint">·</span>
            <span className="inline-flex items-center gap-1 text-text-faint">
              <Clock className="size-3" strokeWidth={2} />
              {withIga(editorName)} 마지막 수정
            </span>
          </>
        )}
      </div>
    </div>
  );
}
