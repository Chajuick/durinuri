"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ImagePlus, Loader2 } from "lucide-react";
import { uploadPhotos } from "@/app/memories/actions";

function UploadButton({ count }: { count: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || count === 0}
      className="flex h-11 items-center justify-center gap-2 rounded-sm bg-primary px-5 text-sm font-bold text-white shadow-soft disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" strokeWidth={2} />
          올리는 중…
        </>
      ) : (
        <>사진 {count > 0 ? `${count}장 ` : ""}올리기</>
      )}
    </button>
  );
}

export function PhotoUploader({ courseId }: { courseId: string }) {
  const [count, setCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await uploadPhotos(fd);
        formRef.current?.reset();
        setCount(0);
      }}
      className="flex flex-col gap-2.5 rounded-lg border border-dashed border-border bg-surface/60 p-4"
    >
      <input type="hidden" name="course_id" value={courseId} />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center justify-center gap-2 rounded-sm border border-border bg-surface py-3 text-sm font-bold text-primary-ink"
      >
        <ImagePlus className="size-5" strokeWidth={1.75} />
        {count > 0 ? `${count}장 선택됨 · 다시 고르기` : "사진 고르기"}
      </button>
      <input
        ref={inputRef}
        name="files"
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setCount(e.target.files?.length ?? 0)}
        className="hidden"
      />

      <input
        name="caption"
        maxLength={80}
        placeholder="캡션 (선택) — 이 사진들에 대한 한마디"
        className="h-10 rounded-sm border border-border bg-bg px-3 text-[13px] outline-none focus:border-primary"
      />

      <div className="flex justify-end">
        <UploadButton count={count} />
      </div>
    </form>
  );
}
