"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { relativeTime, VERDICT_LABELS } from "@/domains/decision/labels";
import { useDecisions, useReviewQueue } from "@/domains/decision/queries";
import type { Verdict } from "@/domains/decision/types";

export default function ArchivePage() {
  const { data: decisions = [] } = useDecisions();
  const { data: queue = [] } = useReviewQueue();
  const dueIds = new Set(queue.map((item) => item.decisionId));

  const active = decisions
    .filter((d) => d.status === "ACTIVE")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <main className="space-y-4 px-5 pt-10">
      <header>
        <h1 className="font-display text-xl font-semibold">나의 판단</h1>
        <p className="mt-1 text-sm text-ink-soft">전체 {active.length}개</p>
      </header>

      <ul className="space-y-2">
        {active.map((decision) => {
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
                  {dueIds.has(decision.id) && (
                    <span className="flex items-center gap-0.5 text-warn">
                      <Clock size={11} aria-hidden /> 검토 대기
                    </span>
                  )}
                </p>
              </Link>
            </li>
          );
        })}
        {active.length === 0 && (
          <li className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-soft">
            아직 기록한 판단이 없어요.
          </li>
        )}
      </ul>
    </main>
  );
}
