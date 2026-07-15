import "server-only";
import { createClient } from "@supabase/supabase-js";
import { PHOTO_BUCKET } from "@/lib/constants";

/**
 * 서버 전용 Supabase 클라이언트 (service_role).
 * RLS를 우회하므로 절대 클라이언트 번들에 포함되면 안 됩니다.
 * 모든 DB/Storage 접근은 이 클라이언트를 통해 서버에서만 수행합니다.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  // 빌드 시점이 아닌 실제 호출 시점에 명확히 알려주기 위한 지연 검증은 아래 getter에서.
}

export function getAdmin() {
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase 환경변수가 없습니다. NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 를 설정하세요.",
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export { PHOTO_BUCKET };
