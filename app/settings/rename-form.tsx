"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Check, AlertTriangle } from "lucide-react";
import { renameMember, type RenameState } from "./actions";

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

export function RenameForm({ initialName }: { initialName: string }) {
  const [state, formAction] = useFormState<RenameState, FormData>(
    renameMember,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          name="name"
          type="text"
          defaultValue={initialName}
          maxLength={20}
          required
          className="h-11 flex-1 rounded-sm border border-border bg-surface px-4 text-[15px] outline-none focus:border-primary"
        />
        <SaveButton />
      </div>
      {state.ok && (
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ok">
          <Check className="size-4" strokeWidth={2} />
          이름을 바꿨어요
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
