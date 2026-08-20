"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { decisionApi } from "@/domains/decision/api";
import { useDecision, useReview } from "@/domains/decision/queries";
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
  const review = useReview(id);

  const [phase, setPhase] = useState<"check" | "verdict">(
    kind === "EVENT_CHECKIN" ? "check" : "verdict",
  );
  const [verdict, setVerdict] = useState<ReviewVerdict | null>(null);
  const [reason, setReason] = useState("");
  const [newConclusion, setNewConclusion] = useState("");

  if (!decision) {
    return <main className="px-5 pt-10 text-sm text-ink-soft">불러오는 중…</main>;
  }

  const currentVersion = decision.versions[decision.versions.length - 1];
  const condition =
    refId !== null && (kind === "DUE_DATE" || kind === "EVENT_CHECKIN")
      ? decision.conditions.find((c) => c.id === refId)
      : null;
  const deferredChallenge =
    refId !== null && kind === "DEFERRED_CHALLENGE"
      ? decision.challenges.find((c) => c.id === refId)
      : null;

  const submit = async () => {
    if (!verdict) {
      return;
    }
    // 보류했던 반론에서 온 재검토라면 반론도 함께 종결한다
    if (deferredChallenge) {
      await decisionApi.resolveChallenge(
        deferredChallenge.id,
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
        <button type="button" onClick={() => router.push("/")} className="self-start text-ink-soft">
          ←
        </button>
        <h1 className="mt-6 text-lg font-bold leading-snug">{decision.title}</h1>
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
            onClick={() => router.push("/")}
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
      <button type="button" onClick={() => router.back()} className="self-start text-ink-soft">
        ←
      </button>
      <h1 className="mt-6 text-lg font-bold leading-snug">{decision.title}</h1>

      <section className="mt-4 rounded-2xl border border-line bg-surface p-4">
        <p className="text-xs text-ink-soft">당시의 판단</p>
        <p className="mt-1 font-semibold">{currentVersion?.conclusion}</p>
        {decision.criteria.length > 0 && (
          <p className="mt-2 text-sm text-ink-soft">
            당시 중요하게 본 것 — {decision.criteria.join(", ")}
          </p>
        )}
        {condition && kind === "DUE_DATE" && (
          <p className="mt-2 text-sm text-warn">📅 “{condition.text}” 시점이 되었어요</p>
        )}
      </section>

      {deferredChallenge && (
        <section className="mt-3 rounded-2xl border border-warn/30 bg-warn-soft p-4">
          <p className="text-xs text-warn">그때 답 못 한 반박, 지금은요?</p>
          <p className="mt-1 text-sm">{deferredChallenge.objection}</p>
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
