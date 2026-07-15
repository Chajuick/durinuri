"use client";

/**
 * 브라우저에서 이미지를 리사이즈/압축해 JPEG Blob으로 반환.
 * 실패하면(예: HEIC 디코드 불가) 원본 파일을 그대로 반환한다.
 * (원본을 반환해도 서명 URL 직접 업로드라 크기 제한 없음)
 */
export async function compressImage(
  file: File,
  maxSize = 1920,
  quality = 0.82,
): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    const longest = Math.max(width, height);
    if (longest > maxSize) {
      const scale = maxSize / longest;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    return blob && blob.size > 0 ? blob : file;
  } catch {
    return file;
  }
}
