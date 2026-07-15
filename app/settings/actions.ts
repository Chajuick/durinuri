"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export interface RenameState {
  ok?: boolean;
  error?: string;
}

export async function renameMember(
  _prev: RenameState,
  formData: FormData,
): Promise<RenameState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "이름을 입력해줘." };
  if (name.length > 20) return { error: "이름은 20자 이내로." };

  const admin = getAdmin();
  const { error } = await admin
    .from("members")
    .update({ name })
    .eq("id", session.memberId);
  if (error) return { error: "이름 변경 중 문제가 생겼어요." };

  // 세션 쿠키의 이름도 갱신
  const token = await signSession({ memberId: session.memberId, name });
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  revalidatePath("/", "layout");
  return { ok: true };
}

export interface SinceState {
  ok?: boolean;
  error?: string;
}

export async function updateSince(
  _prev: SinceState,
  formData: FormData,
): Promise<SinceState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const since = String(formData.get("since_date") ?? "") || null;
  const { error } = await getAdmin()
    .from("app_settings")
    .update({ since_date: since })
    .eq("id", 1);
  if (error) return { error: "저장 중 문제가 생겼어요." };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function logout() {
  cookies().delete(SESSION_COOKIE);
  redirect("/login");
}
