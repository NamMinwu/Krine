"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/archive", label: "아카이브", icon: "📚" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  // 기록 스텝 플로우에서는 탭을 숨겨 몰입을 유지한다
  if (pathname.startsWith("/write")) {
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
              <span aria-hidden>{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
