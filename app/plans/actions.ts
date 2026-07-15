"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import { geocodePlace } from "@/lib/geo/kakao";

async function touchCourse(courseId: string) {
  const session = await getSession();
  await getAdmin()
    .from("courses")
    .update({ updated_by: session?.memberId ?? null })
    .eq("id", courseId);
}

function revalidateCourse(courseId: string) {
  revalidatePath("/");
  revalidatePath("/plans");
  revalidatePath("/memories");
  revalidatePath(`/plans/${courseId}`);
  revalidatePath(`/memories/${courseId}`);
}

/** 코스 생성 → 상세로 이동 */
export async function createCourse(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim() || "새 데이트";
  const date = String(formData.get("date") ?? "") || null;
  const status =
    String(formData.get("status") ?? "planned") === "done" ? "done" : "planned";

  const { data, error } = await getAdmin()
    .from("courses")
    .insert({ title, date, status })
    .select("id")
    .single();
  if (error || !data) throw new Error("코스 생성 실패");

  revalidateCourse(data.id);
  redirect(status === "done" ? `/memories/${data.id}` : `/plans/${data.id}`);
}

export async function updateCourse(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "") || null;
  if (!id) return;

  const patch: Record<string, unknown> = { title: title || "새 데이트", date };
  // memo 필드가 함께 왔을 때만 갱신 (제목만 수정 시 기존 메모 보존)
  if (formData.has("memo")) patch.memo = String(formData.get("memo"));

  await getAdmin().from("courses").update(patch).eq("id", id);
  await touchCourse(id);
  revalidateCourse(id);
}

export async function deleteCourse(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await getAdmin().from("courses").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/plans");
  revalidatePath("/memories");
  redirect("/plans");
}

/** 다녀왔어요 → 간 데이트로 전환 */
export async function markDone(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await getAdmin().from("courses").update({ status: "done" }).eq("id", id);
  await touchCourse(id);
  revalidateCourse(id);
  redirect(`/memories/${id}`);
}

/** 장소 추가 (place_query 지오코딩) */
export async function addStop(formData: FormData) {
  const courseId = String(formData.get("course_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!courseId || !name) return;

  const placeQuery = String(formData.get("place_query") ?? "").trim() || name;
  const arriveAt = String(formData.get("arrive_at") ?? "") || null;
  const stayRaw = String(formData.get("stay_min") ?? "").trim();
  const stayMin = stayRaw ? Number(stayRaw) : null;
  const isReserved = formData.get("is_reserved") != null;

  const admin = getAdmin();
  const { data: last } = await admin
    .from("stops")
    .select("sort_order")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortOrder = (last?.sort_order ?? -1) + 1;

  const coord = await geocodePlace(placeQuery);

  await admin.from("stops").insert({
    course_id: courseId,
    sort_order: sortOrder,
    name,
    place_query: placeQuery,
    lat: coord?.lat ?? null,
    lng: coord?.lng ?? null,
    arrive_at: arriveAt,
    stay_min: Number.isFinite(stayMin) ? stayMin : null,
    is_reserved: isReserved,
  });
  await touchCourse(courseId);
  revalidateCourse(courseId);
}

export async function updateStop(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;

  const placeQuery = String(formData.get("place_query") ?? "").trim() || name;
  const arriveAt = String(formData.get("arrive_at") ?? "") || null;
  const stayRaw = String(formData.get("stay_min") ?? "").trim();
  const stayMin = stayRaw ? Number(stayRaw) : null;
  const isReserved = formData.get("is_reserved") != null;

  const admin = getAdmin();
  // 검색어가 바뀌었으면 재지오코딩
  const { data: prev } = await admin
    .from("stops")
    .select("place_query, lat, lng")
    .eq("id", id)
    .maybeSingle();

  let lat = prev?.lat ?? null;
  let lng = prev?.lng ?? null;
  if (!prev || prev.place_query !== placeQuery || lat == null) {
    const coord = await geocodePlace(placeQuery);
    lat = coord?.lat ?? null;
    lng = coord?.lng ?? null;
  }

  await admin
    .from("stops")
    .update({
      name,
      place_query: placeQuery,
      lat,
      lng,
      arrive_at: arriveAt,
      stay_min: Number.isFinite(stayMin) ? stayMin : null,
      is_reserved: isReserved,
    })
    .eq("id", id);
  if (courseId) await touchCourse(courseId);
  revalidateCourse(courseId);
}

export async function deleteStop(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");
  if (!id) return;
  await getAdmin().from("stops").delete().eq("id", id);
  if (courseId) await touchCourse(courseId);
  revalidateCourse(courseId);
}

/** 순서 변경 (클라이언트에서 정렬된 id 배열 전달) */
export async function reorderStops(courseId: string, orderedIds: string[]) {
  const admin = getAdmin();
  await Promise.all(
    orderedIds.map((id, i) =>
      admin.from("stops").update({ sort_order: i }).eq("id", id),
    ),
  );
  await touchCourse(courseId);
  revalidateCourse(courseId);
}
