"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, Pencil } from "lucide-react";

export function ViewEditToggle({ editing }: { editing: boolean }) {
  const pathname = usePathname();
  const base =
    "flex flex-1 items-center justify-center gap-1.5 rounded-sm py-2 text-[13px] font-bold transition-colors";
  const on = "bg-surface text-primary-ink shadow-soft";
  const off = "text-text-sub";
  return (
    <div className="flex gap-1 rounded-md border border-border bg-surface-2 p-1">
      <Link href={pathname} scroll={false} className={`${base} ${editing ? off : on}`}>
        <Eye className="size-4" strokeWidth={1.75} />
        보기
      </Link>
      <Link
        href={`${pathname}?edit=1`}
        scroll={false}
        className={`${base} ${editing ? on : off}`}
      >
        <Pencil className="size-4" strokeWidth={1.75} />
        편집
      </Link>
    </div>
  );
}
