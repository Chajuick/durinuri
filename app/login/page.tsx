"use client";

import type { CSSProperties } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Lock, User, AlertTriangle } from "lucide-react";
import { PixelSlime } from "@/components/PixelSlime";
import { login, type LoginState } from "./actions";

// 픽셀 하트 (7 x 6)
const HEART = [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."];

function PixelHeart({ style }: { style: CSSProperties }) {
  return (
    <span className="pxHeart" style={style}>
      <svg viewBox="0 0 7 6" shapeRendering="crispEdges">
        {HEART.flatMap((row, y) =>
          [...row].map((c, x) =>
            c === "#" ? (
              <rect
                key={`${x},${y}`}
                x={x}
                y={y}
                width="1"
                height="1"
                fill={x === 1 && y === 1 ? "#ffa7b8" : "#ff5f7a"}
              />
            ) : null,
          ),
        )}
      </svg>
    </span>
  );
}

// 슬라임 주변에서 스멀스멀 올라오는 픽셀 하트들
const HEARTS = [
  { left: "48%", bottom: "36%", w: 14, delay: "0s", dur: "5.4s" },
  { left: "30%", bottom: "42%", w: 10, delay: "1.3s", dur: "6.2s" },
  { left: "66%", bottom: "44%", w: 11, delay: "2.5s", dur: "5.7s" },
  { left: "54%", bottom: "32%", w: 9, delay: "3.6s", dur: "6.5s" },
  { left: "38%", bottom: "38%", w: 12, delay: "4.6s", dur: "5.2s" },
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
        {/* 통통 튀는 픽셀 슬라임 둘 */}
        <div className="duHero" aria-hidden>
          <span className="duGlow" />
          <div className="pxStage">
            <PixelSlime variant="coral" />
            <PixelSlime variant="sky" bounceLate />
          </div>
          <div className="duMinis">
            {HEARTS.map((h, i) => (
              <PixelHeart
                key={i}
                style={{
                  left: h.left,
                  bottom: h.bottom,
                  width: h.w,
                  height: Math.round((h.w * 6) / 7),
                  animationDelay: h.delay,
                  animationDuration: h.dur,
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
