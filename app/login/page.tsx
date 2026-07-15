"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Calendar, Lock, User, AlertTriangle } from "lucide-react";
import { login, type LoginState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 flex h-12 w-full items-center justify-center rounded-sm bg-primary text-[15px] font-bold text-white shadow-soft transition-opacity disabled:opacity-60"
    >
      {pending ? "들어가는 중…" : "들어가기"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState<LoginState, FormData>(login, {});

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-md bg-primary text-white shadow-soft">
          <Calendar className="size-8" strokeWidth={1.75} />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">우리 데이트</h1>
        <p className="mt-2 text-sm text-text-sub">
          공유 비밀번호를 넣고, 이름을 정해줘
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-3">
        <label className="flex items-center gap-3 rounded-sm border border-border bg-surface px-4 shadow-soft focus-within:border-primary">
          <Lock className="size-5 text-text-faint" strokeWidth={1.75} />
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="공유 비밀번호"
            className="h-12 flex-1 bg-transparent text-[15px] outline-none placeholder:text-text-faint"
          />
        </label>

        <label className="flex items-center gap-3 rounded-sm border border-border bg-surface px-4 shadow-soft focus-within:border-primary">
          <User className="size-5 text-text-faint" strokeWidth={1.75} />
          <input
            name="name"
            type="text"
            required
            maxLength={20}
            placeholder="내 이름 (예: 지훈)"
            className="h-12 flex-1 bg-transparent text-[15px] outline-none placeholder:text-text-faint"
          />
        </label>

        {state.error && (
          <p className="flex items-center gap-2 rounded-sm bg-danger-bg px-3 py-2 text-[13px] font-semibold text-danger">
            <AlertTriangle className="size-4" strokeWidth={1.75} />
            {state.error}
          </p>
        )}

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-xs text-text-faint">
        둘만의 공간이에요. 이름은 나중에 설정에서 바꿀 수 있어요.
      </p>
    </main>
  );
}
