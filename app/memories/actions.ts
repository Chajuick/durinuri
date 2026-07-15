"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdmin, PHOTO_BUCKET } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";

function revalidateMemory(courseId: string) {
  revalidatePath("/");
  revalidatePath("/memories");
  revalidatePath(`/memories/${courseId}`);
}

/**
 * 1) 업로드 슬롯 생성 — 파일 개수만큼 서명된 업로드 URL을 발급.
 *    클라이언트가 이 토큰으로 Storage에 직접 올린다(서버/Vercel 크기 제한 우회).
 */
export async function prepareUpload(
  courseId: string,
  count: number,
): Promise<{ path: string; token: string }[]> {
  if (!courseId || count < 1) return [];
  const admin = getAdmin();
  const slots: { path: string; token: string }[] = [];
  for (let i = 0; i < Math.min(count, 20); i++) {
    const path = `${courseId}/${randomUUID()}.jpg`;
    const { data, error } = await admin.storage
      .from(PHOTO_BUCKET)
      .createSignedUploadUrl(path);
    if (error || !data) throw new Error("업로드 준비에 실패했어요.");
    slots.push({ path: data.path, token: data.token });
  }
  return slots;
}

/** 2) 업로드 완료된 파일들을 photos 레코드로 등록 (여정별) */
export async function registerPhotos(
  courseId: string,
  items: { path: string; caption?: string | null }[],
  stopId?: string | null,
) {
  if (!courseId || items.length === 0) return;
  const session = await getSession();
  const admin = getAdmin();

  const rows = items.map((it) => ({
    course_id: courseId,
    stop_id: stopId ?? null,
    author_id: session?.memberId ?? null,
    url: admin.storage.from(PHOTO_BUCKET).getPublicUrl(it.path).data.publicUrl,
    caption: it.caption?.trim() || null,
  }));

  await admin.from("photos").insert(rows);
  revalidateMemory(courseId);
}

/** 여정(장소) 한마디 저장 */
export async function saveJourneyNote(formData: FormData) {
  const stopId = String(formData.get("stop_id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");
  if (!stopId) return;
  const memo = String(formData.get("memo") ?? "").trim() || null;
  await getAdmin().from("stops").update({ memo }).eq("id", stopId);
  revalidateMemory(courseId);
}

export async function deletePhoto(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");
  if (!id) return;
  const admin = getAdmin();

  const { data: photo } = await admin
    .from("photos")
    .select("url")
    .eq("id", id)
    .maybeSingle();

  await admin.from("photos").delete().eq("id", id);

  // 스토리지 오브젝트도 정리 (public URL에서 경로 추출)
  if (photo?.url) {
    const marker = `/${PHOTO_BUCKET}/`;
    const idx = photo.url.indexOf(marker);
    if (idx >= 0) {
      const path = photo.url.slice(idx + marker.length);
      await admin.storage.from(PHOTO_BUCKET).remove([path]);
    }
  }
  revalidateMemory(courseId);
}

export async function setCover(formData: FormData) {
  const courseId = String(formData.get("course_id") ?? "");
  const url = String(formData.get("url") ?? "");
  if (!courseId || !url) return;
  await getAdmin().from("courses").update({ cover_photo: url }).eq("id", courseId);
  revalidateMemory(courseId);
}

/** 내 리뷰 저장 (사람당 코스별 1개 upsert) */
export async function saveReview(formData: FormData) {
  const courseId = String(formData.get("course_id") ?? "");
  const session = await getSession();
  if (!courseId || !session) return;

  const ratingRaw = String(formData.get("rating") ?? "").trim();
  const rating = ratingRaw ? Number(ratingRaw) : null;
  const oneLine = String(formData.get("one_line") ?? "").trim() || null;

  await getAdmin()
    .from("reviews")
    .upsert(
      {
        course_id: courseId,
        author_id: session.memberId,
        rating: rating && rating >= 1 && rating <= 5 ? rating : null,
        one_line: oneLine,
      },
      { onConflict: "course_id,author_id" },
    );
  revalidateMemory(courseId);
}

/** 다시 갈 데이트로 되돌리기 */
export async function markPlanned(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await getAdmin().from("courses").update({ status: "planned" }).eq("id", id);
  revalidatePath("/");
  revalidatePath("/memories");
  revalidatePath("/plans");
  redirect(`/plans/${id}`);
}
