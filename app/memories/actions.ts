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

/** 사진 업로드 (여러 장). Supabase Storage → photos 레코드 */
export async function uploadPhotos(formData: FormData) {
  const courseId = String(formData.get("course_id") ?? "");
  if (!courseId) return;
  const session = await getSession();
  const caption = String(formData.get("caption") ?? "").trim() || null;

  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return;

  const admin = getAdmin();

  for (const file of files) {
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const path = `${courseId}/${randomUUID()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error } = await admin.storage
      .from(PHOTO_BUCKET)
      .upload(path, bytes, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
    if (error) continue;
    const { data } = admin.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    await admin.from("photos").insert({
      course_id: courseId,
      author_id: session?.memberId ?? null,
      url: data.publicUrl,
      caption,
    });
  }

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
