"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Lock, User, AlertTriangle, Heart } from "lucide-react";
import { login, type LoginState } from "./actions";

// 하트 위로 은은하게 떠오르는 미니 하트 (고정값 → SSR 안정)
const MINIS = [
  { left: "50%", size: 13, delay: "0s", dur: "4.6s" },
  { left: "40%", size: 10, delay: "1.6s", dur: "5.2s" },
  { left: "60%", size: 11, delay: "3.0s", dur: "4.9s" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 flex h-12 w-full items-center justify-center rounded-xl bg-primary text-[15px] font-bold text-white shadow-soft transition-opacity disabled:opacity-60"
    >
      {pending ? "들어가는 중…" : "들어가기"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState<LoginState, FormData>(login, {});

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-sm flex-col justify-center overflow-hidden px-6">
      {/* 은은한 배경 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 size-64 rounded-full bg-[#6bb8f2]/20 blur-3xl"
      />

      <div className="relative mb-8 flex flex-col items-center text-center">
        {/* 코랄·하늘이 만나 하나의 하트 */}
        <div className="duHero" aria-hidden>
          <span className="duGlow" />
          <div className="duHeart">
            <svg viewBox="0 0 32 30" fill="none">
              <defs>
                <linearGradient id="duGrad" x1="0" y1="0" x2="1" y2="0.2">
                  <stop offset="0%" stopColor="#f7997f" />
                  <stop offset="42%" stopColor="#f0806a" />
                  <stop offset="58%" stopColor="#6bb8f2" />
                  <stop offset="100%" stopColor="#8ecbf6" />
                </linearGradient>
              </defs>
              <path
                d="M16 28.5C16 28.5 2 20 2 10.2 2 5.3 5.7 2 9.8 2 12.6 2 15 3.9 16 6 17 3.9 19.4 2 22.2 2 26.3 2 30 5.3 30 10.2 30 20 16 28.5 16 28.5Z"
                fill="url(#duGrad)"
              />
              <ellipse
                cx="11"
                cy="9.5"
                rx="3.2"
                ry="2"
                fill="#ffffff"
                opacity="0.5"
                transform="rotate(-25 11 9.5)"
              />
            </svg>
          </div>
          <div className="duMinis">
            {MINIS.map((m, i) => (
              <Heart
                key={i}
                className="duMini"
                fill="currentColor"
                strokeWidth={0}
                style={{
                  left: m.left,
                  width: m.size,
                  height: m.size,
                  animationDelay: m.delay,
                  animationDuration: m.dur,
                }}
              />
            ))}
          </div>
        </div>

        <h1 className="mt-3 text-[30px] font-extrabold tracking-tight">
          두리누리
        </h1>
        <p className="mt-1.5 text-[14px] text-text-sub">
          둘이 함께 계획하고 기억하는 데이트
        </p>
      </div>

      <form
        action={formAction}
        className="relative flex flex-col gap-3 rounded-2xl border border-border bg-surface/70 p-5 shadow-soft backdrop-blur-sm"
      >
        <label className="flex items-center gap-3 rounded-xl border border-border bg-bg px-4 focus-within:border-primary">
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

        <label className="flex items-center gap-3 rounded-xl border border-border bg-bg px-4 focus-within:border-primary">
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
          <p className="flex items-center gap-2 rounded-xl bg-danger-bg px-3 py-2 text-[13px] font-semibold text-danger">
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
