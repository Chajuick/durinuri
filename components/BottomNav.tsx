"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Images, Settings } from "lucide-react";

const ITEMS = [
  { href: "/", label: "홈", icon: Home, exact: true },
  { href: "/plans", label: "갈 데이트", icon: CalendarDays },
  { href: "/memories", label: "간 데이트", icon: Images },
  { href: "/settings", label: "설정", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px] font-semibold ${
                active ? "text-primary-ink" : "text-text-faint"
              }`}
            >
              <Icon
                className="size-[22px]"
                strokeWidth={active ? 2 : 1.75}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
