"use client";

import { useState } from "react";
import { updatePhotoCaption } from "@/app/memories/actions";

/** 사진 캡션 인라인 편집 — 값 바꾼 뒤 포커스 벗어나면 자동 저장 */
export function PhotoCaption({
  photoId,
  courseId,
  initial,
}: {
  photoId: string;
  courseId: string;
  initial: string | null;
}) {
  const [val, setVal] = useState(initial ?? "");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      await updatePhotoCaption(photoId, courseId, val);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <input
      value={val}
      maxLength={80}
      disabled={saving}
      onChange={(e) => {
        setVal(e.target.value);
        setDirty(true);
      }}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      placeholder="캡션 추가…"
      className="w-full bg-transparent px-1.5 py-1 text-[11px] outline-none placeholder:text-text-faint focus:bg-bg"
    />
  );
}
