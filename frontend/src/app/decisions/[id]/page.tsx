"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ComparisonTable from "@/app/_components/ComparisonTable";
import { relativeTime } from "@/domains/decision/labels";
import { useDecision } from "@/domains/decision/queries";
import VersionTimeline from "./_components/VersionTimeline";

const RESOLUTION_LABELS: Record<string, string> = {
  DEFENDED: "방어함",
  REVISED: "판단 수정",
  DEFERRED: "보류 — 재검토 대기",
  OPEN: "진행 중",
};

export default function DecisionDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: decision, isLoading } = useDecision(id);

  if (isLoading || !decision) {
    return <main className="px-5 pt-10 text-sm text-ink-soft">불러오는 중…</main>;
  }

  const currentVersion = decision.versions[decision.versions.length - 1];

  return (
    <main className="space-y-3 px-5 pb-10 pt-6">
      <button type="button" onClick={() => router.back()} className="text-ink-soft">
        ←
      </button>

      <header>
        <div className="flex items-center gap-2 text-xs text-ink-soft">
          {decision.topicTag && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-accent">
              {decision.topicTag}
            </span>
          )}
          <span>{relativeTime(decision.createdAt)}</span>
        </div>
        <h1 className="mt-2 text-xl font-bold">{decision.title}</h1>
      </header>

      {decision.situation && (
        <section className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="text-xs font-semibold text-ink-soft">상황</h2>
          <p className="mt-1 text-sm leading-relaxed">{decision.situation}</p>
        </section>
      )}

      {currentVersion && (
        <section className="rounded-2xl border border-accent/40 bg-accent-soft p-4">
          <h2 className="text-xs font-semibold text-accent">현재 판단</h2>
          <p className="mt-1 font-semibold">{currentVersion.conclusion}</p>
        </section>
      )}

      {decision.criteria.length > 0 && (
        <section className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="text-xs font-semibold text-ink-soft">핵심 판단 기준</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {decision.criteria.map((c) => (
              <span key={c} className="rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent">
                {c}
              </span>
            ))}
          </div>
        </section>
      )}

      {decision.options.length > 0 && (
        <section className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="text-xs font-semibold text-ink-soft">선택지 비교</h2>
          <div className="mt-2">
            <ComparisonTable options={decision.options} />
          </div>
        </section>
      )}

      {decision.conditions.length > 0 && (
        <section className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="text-xs font-semibold text-ink-soft">판단을 바꿀 조건</h2>
          <ul className="mt-2 space-y-1.5">
            {decision.conditions.map((condition) => (
              <li key={condition.id} className="flex items-center gap-2 text-sm">
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                    condition.type === "DATE"
                      ? "bg-accent-soft text-accent"
                      : "bg-warn-soft text-warn"
                  }`}
                >
                  {condition.type === "DATE" ? `📅 ${condition.dueDate}` : "👀 사건형"}
                </span>
                <span className={condition.status === "TRIGGERED" ? "line-through opacity-60" : ""}>
                  {condition.text}
                </span>
                {condition.status === "TRIGGERED" && (
                  <span className="text-xs text-warn">발생함</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {decision.challenges.length > 0 && (
        <section className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="text-xs font-semibold text-ink-soft">⚔️ 검토한 반대 관점</h2>
          <ul className="mt-2 space-y-3">
            {decision.challenges.map((challenge) => (
              <li key={challenge.id} className="border-l-2 border-line pl-3">
                <p className="text-xs text-ink-soft">{challenge.perspective}</p>
                <p className="mt-0.5 text-sm">{challenge.objection}</p>
                {challenge.userAnswer && (
                  <p className="mt-1.5 text-sm">
                    <span className="text-xs text-accent">나의 답변 — </span>
                    {challenge.userAnswer}
                  </p>
                )}
                <span className="mt-1 inline-block rounded-full bg-bg px-2 py-0.5 text-xs text-ink-soft">
                  {RESOLUTION_LABELS[challenge.resolution]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {decision.firstExpression && currentVersion && (
        <section className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="text-xs font-semibold text-ink-soft">처음 vs 지금</h2>
          <p className="mt-1 text-sm text-ink-soft">“{decision.firstExpression}”</p>
          <p className="mt-1 text-sm font-medium">→ “{currentVersion.conclusion}”</p>
        </section>
      )}

      {decision.versions.length > 0 && (
        <section className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="mb-3 text-xs font-semibold text-ink-soft">판단의 변화</h2>
          <VersionTimeline versions={decision.versions} />
        </section>
      )}

      {decision.status === "ACTIVE" && (
        <Link
          href={`/decisions/${decision.id}/review`}
          className="block rounded-xl border border-accent py-3 text-center font-semibold text-accent"
        >
          조건이 바뀌었나요? 다시 검토하기
        </Link>
      )}
    </main>
  );
}
