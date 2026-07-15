import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createCourse } from "@/app/plans/actions";

export default function NewCoursePage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status === "done" ? "done" : "planned";
  const isDone = status === "done";

  return (
    <main className="mx-auto max-w-md px-5 pb-16 pt-6">
      <Link
        href={isDone ? "/memories" : "/plans"}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-text-sub"
      >
        <ChevronLeft className="size-4" strokeWidth={2} />
        뒤로
      </Link>

      <h1 className="text-2xl font-extrabold tracking-tight">
        {isDone ? "간 데이트 만들기" : "갈 데이트 만들기"}
      </h1>
      <p className="mt-2 text-sm text-text-sub">
        {isDone
          ? "다녀온 데이트를 기록하고 사진·리뷰를 남겨요."
          : "제목과 날짜를 정하고, 다음 화면에서 장소를 추가해요."}
      </p>

      <form action={createCourse} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="status" value={status} />

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-bold text-text-sub">제목</span>
          <input
            name="title"
            required
            maxLength={40}
            placeholder="예: 금요일 데이트"
            className="h-12 rounded-sm border border-border bg-surface px-4 text-[15px] outline-none focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-bold text-text-sub">날짜</span>
          <input
            name="date"
            type="date"
            className="h-12 rounded-sm border border-border bg-surface px-4 text-[15px] outline-none focus:border-primary"
          />
        </label>

        <button
          type="submit"
          className="mt-2 h-12 rounded-sm bg-primary text-[15px] font-bold text-white shadow-soft"
        >
          만들기
        </button>
      </form>
    </main>
  );
}
