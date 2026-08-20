"use client";

import Link from "next/link";
import { relativeTime, VERDICT_LABELS } from "@/domains/decision/labels";
import type { DecisionSummary } from "@/domains/decision/types";

export default function RecentDecisions({
  decisions,
  pendingReviews,
}: {
  decisions: DecisionSummary[];
  pendingReviews: number;
}) {
  const active = decisions
    .filter((d) => d.status === "ACTIVE")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">내 판단</h2>
        <p className="text-xs text-ink-soft">
          검토 대기 {pendingReviews} · 완료 {active.length}
        </p>
      </div>
      <ul className="mt-3 space-y-2">
        {active.slice(0, 5).map((d) => {
          const verdict = d.lastVerdict ? VERDICT_LABELS[d.lastVerdict] : null;
          return (
            <li key={d.id}>
              <Link
                href={`/decisions/${d.id}`}
                className="flex items-center justify-between rounded-xl border border-line bg-surface p-3"
              >
                <div>
                  <p className="font-medium">{d.title}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {relativeTime(d.updatedAt)}
                  </p>
                </div>
                {verdict && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${verdict.className}`}
                  >
                    {verdict.icon} {verdict.label}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
        {active.length === 0 && (
          <li className="rounded-xl border border-dashed border-line p-4 text-center text-sm text-ink-soft">
            아직 기록한 판단이 없어요. 오늘의 선택 하나로 시작해보세요.
          </li>
        )}
      </ul>
    </section>
  );
}
