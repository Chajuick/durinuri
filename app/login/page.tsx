"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Lock, User, AlertTriangle, Heart } from "lucide-react";
import { login, type LoginState } from "./actions";

// 슬라임 실루엣 (15 x 12 픽셀)
const BODY = [
  ".....#####.....",
  "...#########...",
  "..###########..",
  ".#############.",
  ".#############.",
  "###############",
  "###############",
  "###############",
  "###############",
  "###############",
  ".#############.",
  "..###########..",
];
const EYES = [
  [4, 5],
  [5, 5],
  [4, 6],
  [5, 6],
  [9, 5],
  [10, 5],
  [9, 6],
  [10, 6],
];
const SHINE = [
  [4, 5],
  [9, 5],
];
const CHEEKS = [
  [2, 7],
  [3, 7],
  [11, 7],
  [12, 7],
];
const MOUTH = [
  [6, 8],
  [8, 8],
  [7, 9],
];
const HILITE = [
  [3, 2],
  [4, 2],
  [5, 2],
  [2, 3],
];

const SKINS = {
  coral: { body: "#f0806a", shade: "#d3694f", hi: "#f8a892" },
  sky: { body: "#6bb8f2", shade: "#4b97d4", hi: "#a6d6f8" },
};

function PixelSlime({
  variant,
  bounceLate,
}: {
  variant: keyof typeof SKINS;
  bounceLate?: boolean;
}) {
  const { body, shade, hi } = SKINS[variant];
  const px = new Map<string, string>();
  BODY.forEach((row, y) =>
    [...row].forEach((c, x) => {
      if (c === "#") px.set(`${x},${y}`, y >= 10 ? shade : body);
    }),
  );
  HILITE.forEach(([x, y]) => px.set(`${x},${y}`, hi));
  CHEEKS.forEach(([x, y]) => px.set(`${x},${y}`, "#ff7d9a"));
  MOUTH.forEach(([x, y]) => px.set(`${x},${y}`, "#5b3b39"));
  EYES.forEach(([x, y]) => px.set(`${x},${y}`, "#3a2b29"));
  SHINE.forEach(([x, y]) => px.set(`${x},${y}`, "#ffffff"));

  return (
    <div className={`pxSlime${bounceLate ? " b" : ""}`}>
      <svg viewBox="0 0 15 12" className="pxImg" shapeRendering="crispEdges">
        {[...px].map(([k, c]) => {
          const [x, y] = k.split(",").map(Number);
          return <rect key={k} x={x} y={y} width="1" height="1" fill={c} />;
        })}
      </svg>
    </div>
  );
}

// 슬라임 사이로 은은하게 떠오르는 미니 하트
const MINIS = [
  { left: "50%", size: 12, delay: "0s", dur: "4.6s" },
  { left: "42%", size: 9, delay: "1.7s", dur: "5.2s" },
  { left: "58%", size: 10, delay: "3.1s", dur: "4.9s" },
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
