import { Star } from "lucide-react";

/** 별점 표시 (읽기 전용) */
export function Stars({
  value,
  className = "size-[15px]",
}: {
  value: number | null;
  className?: string;
}) {
  const v = value ?? 0;
  return (
    <div className="inline-flex gap-[3px]" aria-label={`별점 ${v}점`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={className}
          strokeWidth={1.75}
          style={{
            fill: n <= v ? "var(--primary)" : "none",
            stroke: n <= v ? "var(--primary)" : "var(--text-faint)",
          }}
        />
      ))}
    </div>
  );
}
