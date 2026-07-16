import { Map } from "lucide-react";

/** 장소명으로 네이버 지도 검색을 여는 링크 (좌표 불필요) */
export function NaverMapLink({
  query,
  className,
}: {
  query: string;
  className?: string;
}) {
  const q = query.trim();
  if (!q) return null;
  const href = `https://map.naver.com/p/search/${encodeURIComponent(q)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`네이버 지도에서 "${q}" 보기`}
      title="네이버 지도에서 보기"
      className={`grid size-7 shrink-0 place-items-center rounded-sm text-[#03c75a] ${className ?? ""}`}
    >
      <Map className="size-4" strokeWidth={1.75} />
    </a>
  );
}
