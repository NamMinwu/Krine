"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { relativeTime, VERDICT_LABELS } from "@/domains/decision/labels";
import { useDecisions, useReviewQueue } from "@/domains/decision/queries";
import type { Verdict } from "@/domains/decision/types";

const STATUS_FILTERS = [
  { key: "all", label: "전체" },
  { key: "due", label: "검토 대기 ⏰" },
  { key: "MAINTAINED", label: "유지 ✓" },
  { key: "REVISED", label: "수정됨 ↻" },
  { key: "REVERSED", label: "뒤집음 ⤴" },
] as const;

function ArchiveContent() {
  const router = useRouter();
  const params = useSearchParams();
  const statusFilter = params.get("status") ?? "all";

  const { data: decisions = [] } = useDecisions();
  const { data: queue = [] } = useReviewQueue();
  const dueIds = new Set(queue.map((item) => item.decisionId));

  const active = decisions.filter((d) => d.status === "ACTIVE");

  const filtered = active
    .filter((d) => {
      if (statusFilter === "all") {
        return true;
      }
      if (statusFilter === "due") {
        return dueIds.has(d.id);
      }
      return d.lastVerdict === statusFilter;
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const setParam = (key: "status", value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value === null) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    router.replace(`/archive?${next.toString()}`);
  };

  return (
    <main className="space-y-4 px-5 pt-10">
      <header>
        <h1 className="text-xl font-bold">나의 판단</h1>
        <p className="mt-1 text-sm text-ink-soft">전체 {active.length}개</p>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setParam("status", filter.key === "all" ? null : filter.key)}
            className={`rounded-full px-3 py-1 text-xs ${
              statusFilter === filter.key
                ? "bg-ink text-white"
                : "border border-line bg-surface text-ink-soft"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {filtered.map((decision) => {
          const verdict = decision.lastVerdict
            ? VERDICT_LABELS[decision.lastVerdict as Verdict]
            : null;
          return (
            <li key={decision.id}>
              <Link
                href={`/decisions/${decision.id}`}
                className="block rounded-xl border border-line bg-surface p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{decision.title}</p>
                  {verdict && (
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${verdict.className}`}>
                      {verdict.icon} {verdict.label}
                    </span>
                  )}
                </div>
                <p className="mt-1 flex items-center gap-2 text-xs text-ink-soft">
                  {decision.topicTag && <span>{decision.topicTag}</span>}
                  <span>{relativeTime(decision.updatedAt)}</span>
                  {dueIds.has(decision.id) && <span className="text-warn">⏰ 검토 대기</span>}
                </p>
              </Link>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-soft">
            조건에 맞는 판단이 없어요.
          </li>
        )}
      </ul>
    </main>
  );
}

export default function ArchivePage() {
  return (
    <Suspense>
      <ArchiveContent />
    </Suspense>
  );
}
