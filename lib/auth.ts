import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "./session";
import { getAdmin } from "./supabase/admin";
import type { Member } from "./types";

/** 현재 세션(없으면 null) */
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

/** 세션 필수 — 없으면 /login 으로 */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** 현재 로그인한 멤버 (DB 조회) */
export async function getCurrentMember(): Promise<Member | null> {
  const session = await getSession();
  if (!session) return null;
  const { data } = await getAdmin()
    .from("members")
    .select("*")
    .eq("id", session.memberId)
    .maybeSingle();
  return (data as Member) ?? null;
}

/** 멤버 전체 (둘) */
export async function getMembers(): Promise<Member[]> {
  const { data } = await getAdmin()
    .from("members")
    .select("*")
    .order("created_at", { ascending: true });
  return (data as Member[]) ?? [];
}
