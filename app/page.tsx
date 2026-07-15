import Link from "next/link";
import {
  ChevronRight,
  CalendarDays,
  Camera,
  Plus,
  BookmarkCheck,
  Heart,
} from "lucide-react";
import { getCourses, getStops, getPhotos, getSinceDate } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { formatDate, ddayLabel } from "@/lib/format";
import { BottomNav } from "@/components/BottomNav";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [session, planned, done, since] = await Promise.all([
    getSession(),
    getCourses("planned"),
    getCourses("done"),
    getSinceDate(),
  ]);
  const dday = ddayLabel(since);

  const upcoming = await Promise.all(
    planned.slice(0, 3).map(async (c) => ({
      course: c,
      stops: await getStops(c.id),
    })),
  );
  const recent = await Promise.all(
    [...done]
      .reverse()
      .slice(0, 4)
      .map(async (c) => ({ course: c, photos: await getPhotos(c.id) })),
  );

  return (
    <>
      <main className="mx-auto max-w-md px-5 pb-28 pt-9">
        <header className="mb-7 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text-sub">
              {session?.name ? `${session.name}님, 안녕하세요` : "안녕하세요"}
            </p>
            <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight">
              우리 데이트
            </h1>
          </div>
          {dday && (
            <div className="flex items-center gap-1.5 rounded-full bg-primary-bg px-3.5 py-2 text-primary-ink">
              <Heart className="size-4" strokeWidth={2} fill="currentColor" />
              <span className="tnum text-[15px] font-extrabold">{dday}</span>
            </div>
          )}
        </header>

        {/* 다가오는 데이트 */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-[15px] font-extrabold">
              <CalendarDays className="size-[18px] text-primary" strokeWidth={2} />
              다가오는 데이트
            </h2>
            <Link href="/plans" className="text-[13px] font-semibold text-text-sub">
              전체
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <Link
              href="/new?status=planned"
              className="flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-surface/60 py-6 text-sm font-bold text-primary-ink"
            >
              <Plus className="size-4" strokeWidth={2.25} />
              데이트 계획하기
            </Link>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {upcoming.map(({ course, stops }) => {
                const reserved = stops.filter((s) => s.is_reserved).length;
                return (
                  <li key={course.id}>
                    <Link
                      href={`/plans/${course.id}`}
                      className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface p-4 shadow-soft"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-[15.5px] font-bold">
                          {course.title}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[12.5px] text-text-sub">
                          <span className="tnum">{formatDate(course.date)}</span>
                          <span className="text-text-faint">·</span>
                          <span>장소 {stops.length}</span>
                          {reserved > 0 && (
                            <span className="inline-flex items-center gap-1 text-primary-ink">
                              <BookmarkCheck className="size-3" strokeWidth={2} />
                              {reserved}
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
        </section>

        {/* 최근 추억 */}
        {recent.length > 0 && (
          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-[15px] font-extrabold">
                <Camera className="size-[18px] text-primary" strokeWidth={2} />
                최근 추억
              </h2>
              <Link
                href="/memories"
                className="text-[13px] font-semibold text-text-sub"
              >
                전체
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {recent.map(({ course, photos }) => {
                const cover = course.cover_photo ?? photos[0]?.url ?? null;
                return (
                  <Link
                    key={course.id}
                    href={`/memories/${course.id}`}
                    className="overflow-hidden rounded-lg border border-border bg-surface shadow-soft"
                  >
                    <div className="aspect-[4/3] w-full">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover}
                          alt={course.title}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-[linear-gradient(135deg,#F6B89E,#EF8E86_45%,#D98AA6)]">
                          <Camera className="size-7 text-white/90" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <div className="truncate text-[13px] font-bold">
                        {course.title}
                      </div>
                      <div className="tnum mt-0.5 text-[11px] text-text-sub">
                        {formatDate(course.date)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <BottomNav />
    </>
  );
}
