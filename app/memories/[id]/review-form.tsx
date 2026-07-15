"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useFormStatus } from "react-dom";
import { saveReview } from "@/app/memories/actions";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 rounded-sm bg-primary px-5 text-sm font-bold text-white shadow-soft disabled:opacity-60"
    >
      {pending ? "저장 중…" : "내 리뷰 저장"}
    </button>
  );
}

export function ReviewForm({
  courseId,
  initialRating,
  initialOneLine,
}: {
  courseId: string;
  initialRating: number | null;
  initialOneLine: string | null;
}) {
  const [rating, setRating] = useState(initialRating ?? 0);
  const [hover, setHover] = useState(0);

  return (
    <form
      action={saveReview}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-soft"
    >
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="rating" value={rating} />

      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= (hover || rating);
          return (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n === rating ? 0 : n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${n}점`}
              className="p-0.5"
            >
              <Star
                className="size-7"
                strokeWidth={1.75}
                style={{
                  fill: active ? "var(--primary)" : "none",
                  stroke: active ? "var(--primary)" : "var(--text-faint)",
                }}
              />
            </button>
          );
        })}
      </div>

      <textarea
        name="one_line"
        defaultValue={initialOneLine ?? ""}
        rows={2}
        maxLength={200}
        placeholder="한줄평을 남겨줘"
        className="resize-none rounded-sm border border-border bg-bg px-3 py-2.5 text-[14px] outline-none focus:border-primary"
      />

      <div className="flex justify-end">
        <SaveButton />
      </div>
    </form>
  );
}
