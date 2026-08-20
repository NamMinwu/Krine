"use client";

import Link from "next/link";
import { useState } from "react";
import { Clock, Search } from "lucide-react";
import { relativeTime, VERDICT_LABELS } from "@/domains/decision/labels";
import { useDecisions, useReviewQueue } from "@/domains/decision/queries";
import type { Verdict } from "@/domains/decision/types";

export default function ArchivePage() {
  const [query, setQuery] = useState("");
  const { data: decisions = [] } = useDecisions();
  const { data: queue = [] } = useReviewQueue();
  const dueIds = new Set(queue.map((item) => item.decisionId));

  const active = decisions
    .filter((d) => d.status === "ACTIVE")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const normalized = query.trim().toLowerCase();
  const visible = normalized
    ? active.filter(
        (d) =>
          (d.title ?? "").toLowerCase().includes(normalized) ||
          (d.topicTag ?? "").toLowerCase().includes(normalized),
      )
    : active;

  return (
    <main className="space-y-4 px-5 pt-10">
      <header>
        <h1 className="font-display text-xl font-semibold">나의 판단</h1>
        <p className="mt-1 text-sm text-ink-soft">전체 {active.length}개</p>
      </header>

      <label className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5">
        <Search size={16} className="shrink-0 text-ink-soft" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목이나 태그로 검색"
          className="w-full bg-transparent text-[15px] outline-none placeholder:text-ink-soft"
        />
      </label>

      <ul className="space-y-2">
        {visible.map((decision) => {
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
        {visible.length === 0 && (
          <li className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-soft">
            {normalized
              ? `"${query.trim()}"에 맞는 판단이 없어요.`
              : "아직 기록한 판단이 없어요."}
          </li>
        )}
      </ul>
    </main>
  );
}
