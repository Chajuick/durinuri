"use client";
import { createClient } from "@supabase/supabase-js";

/**
 * 브라우저용 Supabase 클라이언트 (anon 키).
 * 서명된 업로드 URL로 파일을 Storage에 직접 올릴 때만 사용한다.
 * (서버/Vercel 함수의 요청 크기 제한을 우회)
 */
export function browserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}
