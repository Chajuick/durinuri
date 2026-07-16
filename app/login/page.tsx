"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Lock, User, AlertTriangle } from "lucide-react";
import { login, type LoginState } from "./actions";

// 히어로 위로 간헐적으로 떠오르는 하트들 (고정값 → SSR 안정)
const HEARTS = [
  { left: "50%", delay: "0s", dur: "3.6s" },
  { left: "42%", delay: "0.9s", dur: "4.1s" },
  { left: "58%", delay: "1.5s", dur: "3.3s" },
  { left: "47%", delay: "2.3s", dur: "3.9s" },
  { left: "54%", delay: "3.1s", dur: "3.5s" },
];

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
      <div className="mb-9 flex flex-col items-center text-center">
        {/* 분홍·하늘 슬라임이 붙었다 떨어지며 하트가 뿅뿅 */}
        <div className="slimeScene" aria-hidden="true">
          <svg
            width="0"
            height="0"
            className="absolute"
            style={{ position: "absolute" }}
          >
            <defs>
              <filter id="slimeGoo">
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="7"
                  result="blur"
                />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
                  result="goo"
                />
                <feBlend in="SourceGraphic" in2="goo" />
              </filter>
            </defs>
          </svg>

          <div className="slimeBlobs">
            <span className="slimeBlob pink" />
            <span className="slimeBlob sky" />
          </div>

          <div className="slimeHearts">
            {HEARTS.map((h, i) => (
              <span
                key={i}
                className="slimeHeart"
                style={{
                  left: h.left,
                  animationDelay: h.delay,
                  animationDuration: h.dur,
                }}
              >
                <span className="slimeHeartShape" />
              </span>
            ))}
          </div>
        </div>

        <h1 className="text-[30px] font-extrabold tracking-tight">두리누리</h1>
        <p className="mt-1.5 text-[14px] text-text-sub">
          둘이 함께 계획하고 기억하는 데이트
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
