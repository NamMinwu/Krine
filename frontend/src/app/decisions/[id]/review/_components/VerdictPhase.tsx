"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import ComparisonTable from "@/app/_components/ComparisonTable";
import {
  relativeTime,
  REVIEW_VERDICT_OPTIONS,
  type ReviewVerdict,
} from "@/domains/decision/labels";
import { useResolveObjection, useReview } from "@/domains/decision/queries";
import type { Condition, Decision, Objection, QueueKind } from "@/domains/decision/types";

// 재판단 — 당시 기록을 보고 유지/수정/뒤집음으로 새 버전을 기록한다
export default function VerdictPhase({
  decision,
  kind,
  condition,
  deferredObjection,
  onSkip,
}: {
  decision: Decision;
  kind: QueueKind | "MANUAL";
  condition: Condition | null;
  deferredObjection: Objection | null;
  onSkip: () => void;
}) {
  const router = useRouter();
  const review = useReview(decision.id);
  const resolveObjection = useResolveObjection();

  const [verdict, setVerdict] = useState<ReviewVerdict | null>(null);
  const [reason, setReason] = useState("");
  const [newConclusion, setNewConclusion] = useState("");

  const currentVersion = decision.versions[decision.versions.length - 1];

  const submit = async () => {
    if (!verdict) {
      return;
    }
    // 보류했던 반박에서 온 재검토라면 반박도 함께 종결한다
    if (deferredObjection) {
      await resolveObjection.mutateAsync({
        objectionId: deferredObjection.id,
        resolution: verdict === "MAINTAINED" ? "DEFENDED" : "REVISED",
      });
    }
    await review.mutateAsync({
      verdict,
      reason: reason.trim(),
      newConclusion: verdict === "MAINTAINED" ? null : newConclusion.trim(),
      triggeredConditionId: condition?.id ?? null,
    });
    router.replace(`/decisions/${decision.id}`);
  };

  const isSubmitting = review.isPending || resolveObjection.isPending;

  return (
    <>
      <h1 className="font-display mt-6 text-xl font-semibold leading-snug">
        {decision.title}
      </h1>

      <section className="mt-4 rounded-2xl border border-line bg-surface p-4">
        <p className="text-xs text-ink-soft">
          당시의 기록 · {relativeTime(decision.createdAt)}
          {decision.versions.length > 1 && ` · v${decision.versions.length}까지 진행`}
        </p>
        {decision.situation && (
          <p className="mt-2 text-sm leading-relaxed">{decision.situation}</p>
        )}
        <p className="mt-3 rounded-xl bg-accent-soft px-3 py-2 font-semibold text-accent">
          {currentVersion?.conclusion}
        </p>
        {decision.criteria.length > 0 && (
          <p className="mt-2 text-sm text-ink-soft">
            중요하게 본 것 — {decision.criteria.join(", ")}
          </p>
        )}
        {decision.options.length > 0 && (
          <details className="group mt-3 border-t border-line pt-3">
            <summary className="flex cursor-pointer list-none items-center gap-1 text-sm text-ink-soft">
              <ChevronDown
                size={14}
                className="transition-transform group-open:rotate-180"
                aria-hidden
              />
              당시의 선택지 보기
            </summary>
            <div className="mt-2">
              <ComparisonTable options={decision.options} />
            </div>
          </details>
        )}
        {kind === "CHECK_IN" && (
          <p className="mt-2 flex items-center gap-1 text-sm text-warn">
            <Calendar size={13} aria-hidden /> 이 판단을 다시 확인하기로 한 날이에요
          </p>
        )}
        {condition && kind === "DUE_DATE" && (
          <p className="mt-2 flex items-center gap-1 text-sm text-warn">
            <Calendar size={13} aria-hidden /> “{condition.text}” 시점이 되었어요
          </p>
        )}
      </section>

      {deferredObjection && (
        <section className="mt-3 rounded-2xl border border-warn/30 bg-warn-soft p-4">
          <p className="text-xs text-warn">그때 답 못 한 반박, 지금은요?</p>
          <p className="mt-1 text-sm">{deferredObjection.objection}</p>
        </section>
      )}

      <section className="mt-4">
        <p className="text-sm font-semibold">지금은 어떻게 판단하시겠어요?</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {REVIEW_VERDICT_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setVerdict(option.key)}
              className={`rounded-xl border py-3 text-sm font-medium ${
                verdict === option.key
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line bg-surface text-ink-soft"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {verdict && (
          <p className="mt-1.5 text-xs text-ink-soft">
            {REVIEW_VERDICT_OPTIONS.find((o) => o.key === verdict)?.hint}
          </p>
        )}
      </section>

      {verdict && verdict !== "MAINTAINED" && (
        <textarea
          value={newConclusion}
          onChange={(e) => setNewConclusion(e.target.value)}
          placeholder="새로운 결론을 한 문장으로"
          className="mt-3 min-h-16 w-full resize-none rounded-xl border border-line bg-surface p-3 text-[15px] outline-none focus:border-accent"
        />
      )}

      {verdict && (
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="그렇게 판단한 이유는… (예: 무엇을 믿었고, 무엇이 달라졌는지)"
          className="mt-2 min-h-24 w-full resize-none rounded-xl border border-line bg-surface p-3 text-[15px] outline-none focus:border-accent"
        />
      )}

      <button
        type="button"
        disabled={
          !verdict ||
          reason.trim().length === 0 ||
          (verdict !== "MAINTAINED" && newConclusion.trim().length === 0) ||
          isSubmitting
        }
        onClick={() => void submit()}
        className="mt-auto rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-40"
      >
        {isSubmitting ? "기록하고 있어요…" : "새 버전으로 기록하기"}
      </button>
      <p className="mt-2 text-center text-xs text-ink-soft">
        원래 판단은 그대로 남고, 위에 새 버전이 쌓여요.
      </p>
      <button
        type="button"
        onClick={onSkip}
        className="mt-1 py-2 text-center text-sm text-ink-soft underline underline-offset-4"
      >
        지금은 넘어갈게요
      </button>
    </>
  );
}
