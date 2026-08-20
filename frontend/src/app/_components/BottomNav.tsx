"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library } from "lucide-react";

const TABS = [
  { href: "/", label: "홈", icon: Home },
  { href: "/archive", label: "아카이브", icon: Library },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  // 몰입형 플로우(기록·재검토·반박)에서는 탭을 숨긴다 — CTA 가림 방지
  if (
    pathname.startsWith("/write") ||
    pathname.endsWith("/review") ||
    pathname.endsWith("/objection")
  ) {
    return null;
  }
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface">
      <div className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
                isActive ? "font-semibold text-accent" : "text-ink-soft"
              }`}
            >
              <tab.icon size={20} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
