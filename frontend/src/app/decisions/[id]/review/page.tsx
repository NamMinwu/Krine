"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useDecision } from "@/domains/decision/queries";
import type { QueueKind } from "@/domains/decision/types";
import CheckinPhase from "./_components/CheckinPhase";
import ReviewProgressHeader from "./_components/ReviewProgressHeader";
import VerdictPhase from "./_components/VerdictPhase";
import { useReviewQueuePosition } from "./_hooks/useReviewQueuePosition";

function ReviewContent({
  id,
  kind,
  refId,
}: {
  id: number;
  kind: QueueKind | "MANUAL";
  refId: number | null;
}) {
  const router = useRouter();
  const { data: decision } = useDecision(id);
  const queue = useReviewQueuePosition(id, kind, refId);
  const [phase, setPhase] = useState<"check" | "verdict">(
    kind === "EVENT_CHECKIN" ? "check" : "verdict",
  );

  if (!decision) {
    return <main className="px-5 pt-10 text-sm text-ink-soft">불러오는 중…</main>;
  }

  const condition =
    refId !== null && (kind === "DUE_DATE" || kind === "EVENT_CHECKIN")
      ? (decision.conditions.find((c) => c.id === refId) ?? null)
      : null;
  const deferredObjection =
    refId !== null && kind === "DEFERRED_OBJECTION"
      ? (decision.objections.find((o) => o.id === refId) ?? null)
      : null;

  return (
    <main className="flex min-h-dvh flex-col px-5 pb-8 pt-6">
      <ReviewProgressHeader
        index={queue.index}
        total={queue.total}
        onBack={() =>
          phase === "check" ? router.push("/") : router.back()
        }
      />
      {phase === "check" && condition ? (
        <CheckinPhase
          title={decision.title ?? ""}
          conditionText={condition.text}
          onOccurred={() => setPhase("verdict")}
          onNotYet={queue.goNext}
        />
      ) : (
        <VerdictPhase
          decision={decision}
          kind={kind}
          condition={condition}
          deferredObjection={deferredObjection}
          onSkip={queue.goNext}
        />
      )}
    </main>
  );
}

export default function ReviewPage() {
  return (
    <Suspense>
      <ReviewRoute />
    </Suspense>
  );
}

// URL이 바뀌면 key로 리마운트되어 화면 상태가 초기화된다 (동기화 useEffect 불필요)
function ReviewRoute() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const id = Number(params.id);
  const kind = (search.get("kind") ?? "MANUAL") as QueueKind | "MANUAL";
  const refId = search.get("ref") ? Number(search.get("ref")) : null;

  return <ReviewContent key={`${id}-${kind}-${refId}`} id={id} kind={kind} refId={refId} />;
}
