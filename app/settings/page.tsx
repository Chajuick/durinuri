import { LogOut, UserCog, Heart } from "lucide-react";
import { getCurrentMember } from "@/lib/auth";
import { getSinceDate } from "@/lib/data";
import { BottomNav } from "@/components/BottomNav";
import { RenameForm } from "./rename-form";
import { SinceForm } from "./since-form";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [member, since] = await Promise.all([
    getCurrentMember(),
    getSinceDate(),
  ]);

  return (
    <>
      <main className="mx-auto max-w-md px-5 pb-28 pt-8">
        <h1 className="text-2xl font-extrabold tracking-tight">설정</h1>

        <section className="mt-6 rounded-md border border-border bg-surface p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold">
            <UserCog className="size-5 text-primary" strokeWidth={1.75} />
            내 이름
          </div>
          <p className="mb-3 text-[13px] text-text-sub">
            바꾸면 내가 올린 사진·리뷰 표시도 함께 바뀌어요.
          </p>
          <RenameForm initialName={member?.name ?? ""} />
        </section>

        <section className="mt-4 rounded-md border border-border bg-surface p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold">
            <Heart className="size-5 text-primary" strokeWidth={1.75} />
            우리 만난 날
          </div>
          <p className="mb-3 text-[13px] text-text-sub">
            만난 시작일을 정하면 홈에서 D-day를 볼 수 있어요.
          </p>
          <SinceForm initialSince={since} />
        </section>

        <form action={logout} className="mt-4">
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-sm border border-border bg-surface text-sm font-bold text-danger shadow-soft"
          >
            <LogOut className="size-5" strokeWidth={1.75} />
            로그아웃
          </button>
        </form>
      </main>
      <BottomNav />
    </>
  );
}
