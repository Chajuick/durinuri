"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "crypto";
import { getAdmin } from "@/lib/supabase/admin";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import type { Member } from "@/lib/types";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export interface LoginState {
  error?: string;
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  const expected = process.env.SHARE_PASSWORD;
  if (!expected) return { error: "서버에 비밀번호가 설정되지 않았어요." };
  if (!safeEqual(password, expected)) {
    return { error: "비밀번호가 맞지 않아요." };
  }
  if (!name) return { error: "이름을 입력해줘." };
  if (name.length > 20) return { error: "이름은 20자 이내로." };

  const admin = getAdmin();

  // 같은 이름이면 재사용(다른 기기에서 로그인 시 동일 정체성 유지)
  const { data: existing } = await admin
    .from("members")
    .select("*")
    .eq("name", name)
    .maybeSingle();

  let member = existing as Member | null;

  if (!member) {
    const { count } = await admin
      .from("members")
      .select("*", { count: "exact", head: true });
    const color = (count ?? 0) === 0 ? "coral" : "blue";
    const { data: created, error } = await admin
      .from("members")
      .insert({ name, color })
      .select("*")
      .single();
    if (error || !created) return { error: "로그인 처리 중 문제가 생겼어요." };
    member = created as Member;
  }

  const token = await signSession({ memberId: member.id, name: member.name });
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/");
}
