import "server-only";
import { getAdmin } from "./supabase/admin";
import type { Course, CourseStatus, Stop, Review, Photo, Member } from "./types";

export async function getCourses(status?: CourseStatus): Promise<Course[]> {
  let q = getAdmin()
    .from("courses")
    .select("*")
    .order("date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  if (status) q = q.eq("status", status);
  const { data } = await q;
  return (data as Course[]) ?? [];
}

export async function getCourse(id: string): Promise<Course | null> {
  const { data } = await getAdmin()
    .from("courses")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Course) ?? null;
}

export async function getStops(courseId: string): Promise<Stop[]> {
  const { data } = await getAdmin()
    .from("stops")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });
  return (data as Stop[]) ?? [];
}

export async function getReviews(courseId: string): Promise<Review[]> {
  const { data } = await getAdmin()
    .from("reviews")
    .select("*")
    .eq("course_id", courseId);
  return (data as Review[]) ?? [];
}

export async function getPhotos(courseId: string): Promise<Photo[]> {
  const { data } = await getAdmin()
    .from("photos")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at", { ascending: true });
  return (data as Photo[]) ?? [];
}

export async function getSinceDate(): Promise<string | null> {
  const { data } = await getAdmin()
    .from("app_settings")
    .select("since_date")
    .eq("id", 1)
    .maybeSingle();
  return (data?.since_date as string) ?? null;
}

export async function getMembersMap(): Promise<Record<string, Member>> {
  const { data } = await getAdmin().from("members").select("*");
  const map: Record<string, Member> = {};
  for (const m of (data as Member[]) ?? []) map[m.id] = m;
  return map;
}
