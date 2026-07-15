"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Check, AlertTriangle } from "lucide-react";
import { updateSince, type SinceState } from "./actions";
import { ddayLabel } from "@/lib/format";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 shrink-0 rounded-sm bg-primary px-5 text-sm font-bold text-white shadow-soft disabled:opacity-60"
    >
      {pending ? "저장 중…" : "저장"}
    </button>
  );
}

export function SinceForm({ initialSince }: { initialSince: string | null }) {
  const [state, formAction] = useFormState<SinceState, FormData>(updateSince, {});
  const dday = ddayLabel(initialSince);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          name="since_date"
          type="date"
          defaultValue={initialSince ?? ""}
          className="h-11 flex-1 rounded-sm border border-border bg-surface px-4 text-[15px] outline-none focus:border-primary"
        />
        <SaveButton />
      </div>
      {dday && (
        <p className="text-[13px] font-semibold text-primary-ink">
          오늘 우리 <span className="tnum">{dday}</span>
        </p>
      )}
      {state.ok && (
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ok">
          <Check className="size-4" strokeWidth={2} />
          저장했어요
        </p>
      )}
      {state.error && (
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-danger">
          <AlertTriangle className="size-4" strokeWidth={1.75} />
          {state.error}
        </p>
      )}
    </form>
  );
}
