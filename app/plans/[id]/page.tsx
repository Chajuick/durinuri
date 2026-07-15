import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Check, Trash2 } from "lucide-react";
import { getCourse, getStops, getMembersMap } from "@/lib/data";
import { buildSegments } from "@/lib/geo/travel";
import { groupStopsByDay } from "@/lib/stops";
import { ensureCoords } from "@/lib/geo/backfill";
import { markDone, deleteCourse } from "@/app/plans/actions";
import { StopRow } from "./stop-row";
import { AddStop } from "./add-stop";
import { TravelBlock } from "@/components/TravelBlock";
import { CourseHeader } from "@/components/CourseHeader";
import { DayHeader } from "@/components/DayHeader";
import { WeatherChip } from "@/components/WeatherChip";
import { getDayWeather } from "@/lib/weather";

export const dynamic = "force-dynamic";

export default async function CourseDetail({
  params,
}: {
  params: { id: string };
}) {
  const course = await getCourse(params.id);
  if (!course) notFound();
  if (course.status === "done") redirect(`/memories/${course.id}`);

  const stops = await ensureCoords(await getStops(course.id));
  const segments = await buildSegments(stops, course.date);
  const members = await getMembersMap();

  const segByFrom = new Map(segments.map((s) => [s.fromStopId, s]));
  const editorName = course.updated_by ? members[course.updated_by]?.name : null;
  const days = groupStopsByDay(stops, course.date);
  const multiDay = days.length > 1;
  const dayWeather = await Promise.all(
    days.map((d) => {
      const c = d.stops.find((s) => s.lat != null && s.lng != null);
      return c ? getDayWeather(c.lat!, c.lng!, d.date) : Promise.resolve(null);
    }),
  );

  return (
    <main className="mx-auto max-w-md px-5 pb-24 pt-6">
      <Link
        href="/plans"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-text-sub"
      >
        <ChevronLeft className="size-4" strokeWidth={2} />
        갈 데이트
      </Link>

      <CourseHeader
        id={course.id}
        title={course.title}
        date={course.date}
        editorName={editorName}
      />

      {!multiDay && dayWeather[0] && (
        <div className="mt-3">
          <WeatherChip weather={dayWeather[0]} />
        </div>
      )}

      {/* 타임라인 */}
      <section className="mt-6 flex flex-col">
        {stops.length === 0 && (
          <p className="rounded-md border border-dashed border-border bg-surface/60 px-4 py-6 text-center text-sm text-text-sub">
            아직 장소가 없어요. 아래에서 첫 장소를 추가해봐요.
          </p>
        )}
        {days.map((day, di) => (
          <div key={day.date ?? "nodate"} className="flex flex-col">
            {multiDay && (
              <DayHeader
                date={day.date}
                right={
                  dayWeather[di] ? (
                    <WeatherChip weather={dayWeather[di]!} />
                  ) : undefined
                }
              />
            )}
            {day.stops.map((stop) => {
              const seg = segByFrom.get(stop.id);
              return (
                <div key={stop.id} className="flex flex-col">
                  <StopRow stop={stop} courseId={course.id} />
                  {seg && <TravelBlock segment={seg} />}
                </div>
              );
            })}
          </div>
        ))}
      </section>

      <div className="mt-3">
        <AddStop courseId={course.id} courseDate={course.date} />
      </div>

      {/* 액션 */}
      <div className="mt-8 flex flex-col gap-2.5">
        <form action={markDone}>
          <input type="hidden" name="id" value={course.id} />
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-primary text-[15px] font-bold text-white shadow-soft"
          >
            <Check className="size-5" strokeWidth={2} />
            다녀왔어요
          </button>
        </form>
        <form action={deleteCourse}>
          <input type="hidden" name="id" value={course.id} />
          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-sm border border-border bg-surface text-[13px] font-bold text-danger"
          >
            <Trash2 className="size-4" strokeWidth={1.75} />이 데이트 삭제
          </button>
        </form>
      </div>
    </main>
  );
}
