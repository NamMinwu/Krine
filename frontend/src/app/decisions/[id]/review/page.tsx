"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Calendar, ChevronDown } from "lucide-react";
import ComparisonTable from "@/app/_components/ComparisonTable";
import { relativeTime } from "@/domains/decision/labels";
import { Suspense, useEffect, useState } from "react";
import { decisionApi } from "@/domains/decision/api";
import { useDecision, useReview, useReviewQueue } from "@/domains/decision/queries";
import type { QueueKind } from "@/domains/decision/types";

type ReviewVerdict = "MAINTAINED" | "REVISED" | "REVERSED";

const VERDICT_OPTIONS: { key: ReviewVerdict; label: string; hint: string }[] = [
  { key: "MAINTAINED", label: "유지", hint: "당시 판단이 여전히 맞아요" },
  { key: "REVISED", label: "수정", hint: "결론을 다듬어야겠어요" },
  { key: "REVERSED", label: "뒤집음", hint: "반대 결론으로 바꿔요" },
];

function ReviewContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const id = Number(params.id);
  const kind = (search.get("kind") ?? "MANUAL") as QueueKind | "MANUAL";
  const refId = search.get("ref") ? Number(search.get("ref")) : null;

  const { data: decision } = useDecision(id);
  const { data: queue = [] } = useReviewQueue();
  const review = useReview(id);

  const [phase, setPhase] = useState<"check" | "verdict">(
    kind === "EVENT_CHECKIN" ? "check" : "verdict",
  );
  const [verdict, setVerdict] = useState<ReviewVerdict | null>(null);
  const [reason, setReason] = useState("");
  const [newConclusion, setNewConclusion] = useState("");

  // 큐의 다음 항목으로 이어가면 URL만 바뀌므로 화면 상태를 초기화한다
  useEffect(() => {
    setPhase(kind === "EVENT_CHECKIN" ? "check" : "verdict");
    setVerdict(null);
    setReason("");
    setNewConclusion("");
  }, [id, kind, refId]);

  // 큐에서 지금 항목의 위치 (수동 진입이면 -1 → 카운터 숨김)
  const queueIndex = queue.findIndex(
    (item) => item.decisionId === id && item.kind === kind && item.refId === refId,
  );
  const progress = queueIndex >= 0 && (
    <span className="text-xs text-ink-soft">
      재검토 {queueIndex + 1} / {queue.length}
    </span>
  );
  const progressBar = queueIndex >= 0 && queue.length > 1 && (
    <div className="mt-3 h-1 w-full rounded-full bg-line">
      <div
        className="h-1 rounded-full bg-warn transition-all"
        style={{ width: `${((queueIndex + 1) / queue.length) * 100}%` }}
      />
    </div>
  );

  // "한 번에 하나씩, 이어서" — 큐의 다음 순번으로 이동, 마지막이면 홈으로.
  // (건너뛴 항목은 큐에 남지만, 한 바퀴에 한 번씩만 보여준다)
  const goNext = () => {
    if (queueIndex >= 0 && queueIndex + 1 < queue.length) {
      const next = queue[queueIndex + 1];
      router.push(
        `/decisions/${next.decisionId}/review?ref=${next.refId}&kind=${next.kind}`,
      );
    } else {
      router.push("/");
    }
  };

  if (!decision) {
    return <main className="px-5 pt-10 text-sm text-ink-soft">불러오는 중…</main>;
  }

  const currentVersion = decision.versions[decision.versions.length - 1];
  const condition =
    refId !== null && (kind === "DUE_DATE" || kind === "EVENT_CHECKIN")
      ? decision.conditions.find((c) => c.id === refId)
      : null;
  const deferredObjection =
    refId !== null && kind === "DEFERRED_OBJECTION"
      ? decision.objections.find((c) => c.id === refId)
      : null;

  const submit = async () => {
    if (!verdict) {
      return;
    }
    // 보류했던 반론에서 온 재검토라면 반론도 함께 종결한다
    if (deferredObjection) {
      await decisionApi.resolveObjection(
        deferredObjection.id,
        verdict === "MAINTAINED" ? "DEFENDED" : "REVISED",
      );
    }
    await review.mutateAsync({
      verdict,
      reason: reason.trim(),
      newConclusion: verdict === "MAINTAINED" ? null : newConclusion.trim(),
      triggeredConditionId: condition?.id ?? null,
    });
    router.replace(`/decisions/${id}`);
  };

  if (phase === "check" && condition) {
    return (
      <main className="flex min-h-dvh flex-col px-5 pb-8 pt-6">
        <div className="flex w-full items-center justify-between">
          <button type="button" onClick={() => router.push("/")} className="text-ink-soft">
            ←
          </button>
          {progress}
        </div>
        {progressBar}
        <h1 className="font-display mt-6 text-xl font-semibold leading-snug">{decision.title}</h1>
        <div className="mt-4 rounded-2xl border border-warn/30 bg-warn-soft p-4">
          <p className="text-sm">
            판단을 저장할 때 이렇게 적어두셨어요:
          </p>
          <p className="mt-2 font-medium">“{condition.text}”</p>
          <p className="mt-2 text-sm text-ink-soft">이 조건, 발생했나요?</p>
        </div>
        <div className="mt-auto space-y-2 pt-6">
          <button
            type="button"
            onClick={() => setPhase("verdict")}
            className="w-full rounded-xl bg-warn py-3 font-semibold text-white"
          >
            발생했어요 — 다시 판단할게요
          </button>
          <button
            type="button"
            onClick={goNext}
            className="w-full rounded-xl border border-line py-3 text-ink-soft"
          >
            아직이에요
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col px-5 pb-8 pt-6">
      <div className="flex w-full items-center justify-between">
        <button type="button" onClick={() => router.back()} className="text-ink-soft">
          ←
        </button>
        {progress}
      </div>
      {progressBar}
      <h1 className="font-display mt-6 text-xl font-semibold leading-snug">{decision.title}</h1>

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
              <ChevronDown size={14} className="transition-transform group-open:rotate-180" aria-hidden />
              당시의 선택지·전제 보기
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
          {VERDICT_OPTIONS.map((option) => (
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
            {VERDICT_OPTIONS.find((o) => o.key === verdict)?.hint}
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
          placeholder="그렇게 판단한 이유는… (예: 어떤 전제가 틀렸는지, 무엇이 달라졌는지)"
          className="mt-2 min-h-24 w-full resize-none rounded-xl border border-line bg-surface p-3 text-[15px] outline-none focus:border-accent"
        />
      )}

      <button
        type="button"
        disabled={
          !verdict ||
          reason.trim().length === 0 ||
          (verdict !== "MAINTAINED" && newConclusion.trim().length === 0) ||
          review.isPending
        }
        onClick={() => void submit()}
        className="mt-auto rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-40"
      >
        {review.isPending ? "기록하고 있어요…" : "새 버전으로 기록하기"}
      </button>
      <p className="mt-2 text-center text-xs text-ink-soft">
        원래 판단은 그대로 남고, 위에 새 버전이 쌓여요.
      </p>
      <button
        type="button"
        onClick={goNext}
        className="mt-1 py-2 text-center text-sm text-ink-soft underline underline-offset-4"
      >
        지금은 넘어갈게요
      </button>
    </main>
  );
}

export default function ReviewPage() {
  return (
    <Suspense>
      <ReviewContent />
    </Suspense>
  );
}
