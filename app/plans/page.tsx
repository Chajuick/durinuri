import Link from "next/link";
import { Plus, ChevronRight, CalendarDays, BookmarkCheck } from "lucide-react";
import { getCourses, getStops } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { BottomNav } from "@/components/BottomNav";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const courses = await getCourses("planned");
  const withStops = await Promise.all(
    courses.map(async (c) => ({ course: c, stops: await getStops(c.id) })),
  );

  return (
    <>
      <main className="mx-auto max-w-md px-5 pb-28 pt-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">갈 데이트</h1>
          <Link
            href="/new?status=planned"
            className="flex items-center gap-1.5 rounded-sm bg-primary px-3.5 py-2 text-[13px] font-bold text-white shadow-soft"
          >
            <Plus className="size-4" strokeWidth={2.25} />새 데이트
          </Link>
        </div>

        {withStops.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <CalendarDays className="size-10 text-text-faint" strokeWidth={1.5} />
            <p className="text-text-sub">아직 예정된 데이트가 없어요</p>
            <Link
              href="/new?status=planned"
              className="rounded-sm bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-soft"
            >
              첫 데이트 계획하기
            </Link>
          </div>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {withStops.map(({ course, stops }) => {
              const reserved = stops.filter((s) => s.is_reserved).length;
              return (
                <li key={course.id}>
                  <Link
                    href={`/plans/${course.id}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface p-4 shadow-soft"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[16px] font-bold">
                        {course.title}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[12.5px] text-text-sub">
                        <span className="tnum">{formatDate(course.date)}</span>
                        <span className="text-text-faint">·</span>
                        <span>장소 {stops.length}</span>
                        {reserved > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary-bg px-2 py-[2px] text-[11px] font-bold text-primary-ink">
                            <BookmarkCheck className="size-3" strokeWidth={2} />
                            예약 {reserved}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      className="size-5 shrink-0 text-text-faint"
                      strokeWidth={1.75}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <BottomNav />
    </>
  );
}
