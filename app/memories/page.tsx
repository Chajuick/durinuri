import Link from "next/link";
import { Plus, Camera, MessageSquareText } from "lucide-react";
import { getCourses, getPhotos, getReviews } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { BottomNav } from "@/components/BottomNav";
import { SlimePair } from "@/components/PixelSlime";

export const dynamic = "force-dynamic";

export default async function MemoriesPage() {
  const courses = await getCourses("done");
  const cards = await Promise.all(
    courses.map(async (c) => ({
      course: c,
      photos: await getPhotos(c.id),
      reviews: await getReviews(c.id),
    })),
  );
  // 최근 다녀온 순
  cards.reverse();

  return (
    <>
      <main className="mx-auto max-w-md px-5 pb-28 pt-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">간 데이트</h1>
          <Link
            href="/new?status=done"
            className="flex items-center gap-1.5 rounded-sm bg-primary px-3.5 py-2 text-[13px] font-bold text-white shadow-soft"
          >
            <Plus className="size-4" strokeWidth={2.25} />추억 추가
          </Link>
        </div>

        {cards.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <SlimePair width={52} />
            <p className="text-text-sub">아직 기록한 추억이 없어요</p>
          </div>
        ) : (
          <ul className="mt-5 flex flex-col gap-5">
            {cards.map(({ course, photos, reviews }) => {
              const cover = course.cover_photo ?? photos[0]?.url ?? null;
              return (
                <li key={course.id}>
                  <Link
                    href={`/memories/${course.id}`}
                    className="block overflow-hidden rounded-lg border border-border bg-surface shadow-soft"
                  >
                    <div className="relative aspect-[4/3] w-full">
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
                          <Camera className="size-9 text-white/90" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-[17px] font-extrabold tracking-tight">
                        {course.title}
                      </h3>
                      <div className="mt-1.5 flex items-center gap-2 text-[12.5px] text-text-sub">
                        <span className="tnum">{formatDate(course.date)}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-bg px-2 py-[2px] text-[11px] font-bold text-primary-ink">
                          <Camera className="size-3" strokeWidth={2} />
                          {photos.length}
                        </span>
                        {reviews.length > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-you-bg px-2 py-[2px] text-[11px] font-bold text-you-ink">
                            <MessageSquareText className="size-3" strokeWidth={2} />
                            {reviews.length}
                          </span>
                        )}
                      </div>
                    </div>
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
