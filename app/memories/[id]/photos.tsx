"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, AlertTriangle } from "lucide-react";
import { prepareUpload, registerPhotos } from "@/app/memories/actions";
import { browserClient } from "@/lib/supabase/browser";
import { compressImage } from "@/lib/image";
import { PHOTO_BUCKET } from "@/lib/constants";

export function PhotoUploader({
  courseId,
  stopId,
  compact,
}: {
  courseId: string;
  stopId?: string | null;
  compact?: boolean;
}) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const captionRef = useRef<HTMLInputElement>(null);

  function reset() {
    setFiles([]);
    if (inputRef.current) inputRef.current.value = "";
    if (captionRef.current) captionRef.current.value = "";
  }

  async function handleUpload() {
    if (files.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    setProgress(0);
    try {
      // 1) 압축
      const blobs = await Promise.all(
        files.map((f) => compressImage(f).catch(() => f)),
      );
      // 2) 서명 URL 발급
      const slots = await prepareUpload(courseId, blobs.length);
      if (slots.length !== blobs.length) throw new Error("prepare mismatch");
      // 3) Storage로 직접 업로드
      const supa = browserClient();
      let done = 0;
      for (let i = 0; i < blobs.length; i++) {
        const { error: upErr } = await supa.storage
          .from(PHOTO_BUCKET)
          .uploadToSignedUrl(slots[i].path, slots[i].token, blobs[i], {
            contentType: "image/jpeg",
          });
        if (upErr) throw upErr;
        done += 1;
        setProgress(Math.round((done / blobs.length) * 100));
      }
      // 4) DB 등록
      const caption = captionRef.current?.value ?? "";
      await registerPhotos(
        courseId,
        slots.map((s) => ({ path: s.path, caption })),
        stopId ?? null,
      );
      reset();
      router.refresh();
    } catch {
      setError("업로드에 실패했어요. 잠시 후 다시 시도해줘.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-dashed border-border bg-surface/60 p-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex items-center justify-center gap-2 rounded-sm border border-border bg-surface py-3 text-sm font-bold text-primary-ink disabled:opacity-60"
      >
        <ImagePlus className="size-5" strokeWidth={1.75} />
        {files.length > 0
          ? `${files.length}장 선택됨 · 다시 고르기`
          : "사진 고르기"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        className="hidden"
      />

      <input
        ref={captionRef}
        maxLength={80}
        placeholder="캡션 (선택) — 이 사진들에 대한 한마디"
        className="h-10 rounded-sm border border-border bg-bg px-3 text-[13px] outline-none focus:border-primary"
      />

      {error && (
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-danger">
          <AlertTriangle className="size-4" strokeWidth={1.75} />
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleUpload}
          disabled={busy || files.length === 0}
          className="flex h-11 items-center justify-center gap-2 rounded-sm bg-primary px-5 text-sm font-bold text-white shadow-soft disabled:opacity-50"
        >
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" strokeWidth={2} />
              올리는 중… {progress}%
            </>
          ) : (
            <>사진 {files.length > 0 ? `${files.length}장 ` : ""}올리기</>
          )}
        </button>
      </div>
    </div>
  );
}
