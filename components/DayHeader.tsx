import type { ReactNode } from "react";
import { formatDate } from "@/lib/format";

export function DayHeader({
  date,
  right,
}: {
  date: string | null;
  right?: ReactNode;
}) {
  return (
    <div className="mb-2 mt-5 flex items-center justify-between gap-2 first:mt-0">
      <span className="text-[13px] font-extrabold text-primary-ink">
        {formatDate(date)}
      </span>
      {right}
    </div>
  );
}
