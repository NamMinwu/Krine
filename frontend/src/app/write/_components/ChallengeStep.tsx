"use client";

import { useState } from "react";
import { decisionApi } from "@/domains/decision/api";
import type { ChallengeResult } from "@/domains/decision/types";
import StepShell from "./StepShell";

type Phase = "intro" | "objection" | "reflect" | "resolving";

export default function ChallengeStep({
  decisionId,
  onRevise,
  onDone,
}: {
  decisionId: number;
  onRevise: () => void;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [challenge, setChallenge] = useState<ChallengeResult | null>(null);
  const [answer, setAnswer] = useState("");
  const [reflectBack, setReflectBack] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const startChallenge = async () => {
    setIsBusy(true);
    try {
      const result = await decisionApi.challenge(decisionId);
      setChallenge(result);
      setAnswer("");
      setReflectBack("");
      setNotice(null);
      setPhase("objection");
    } finally {
      setIsBusy(false);
    }
  };

  const submitAnswer = async () => {
    if (!challenge) {
      return;
    }
    setIsBusy(true);
    try {
      const result = await decisionApi.answerChallenge(challenge.challengeId, answer.trim());
      setReflectBack(result.reflectBack);
      setPhase("reflect");
    } finally {
      setIsBusy(false);
    }
  };

  const resolve = async (resolution: "DEFENDED" | "REVISED" | "DEFERRED") => {
    if (!challenge) {
      return;
    }
    setIsBusy(true);
    try {
      await decisionApi.resolveChallenge(challenge.challengeId, resolution);
      if (resolution === "REVISED") {
        onRevise();
        return;
      }
      if (resolution === "DEFERRED") {
        setNotice("이 반론은 보류로 저장했어요. 재검토 때 다시 만나요.");
      }
      if (challenge.remaining > 0) {
        setPhase("resolving");
      } else {
        onDone();
      }
    } finally {
      setIsBusy(false);
    }
  };

  if (phase === "intro") {
    return (
      <StepShell stepNo={4} title="다른 관점에서 검토해볼까요?">
        <p className="text-sm text-ink-soft">
          제가 반론을 하나씩 던질게요. 답은 당신이 씁니다. 결론이 바뀌지 않아도
          좋아요 — 판단의 이유가 또렷해지는 것이 목적이에요.
        </p>
        <div className="mt-auto space-y-2 pt-6">
          <button
            type="button"
            disabled={isBusy}
            onClick={startChallenge}
            className="w-full rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-40"
          >
            ⚔️ 다른 관점에서 검토해보기
          </button>
          <button
            type="button"
            onClick={onDone}
            className="w-full py-2 text-center text-sm text-ink-soft underline"
          >
            건너뛰어도 좋아요
          </button>
        </div>
      </StepShell>
    );
  }

  if (phase === "resolving") {
    return (
      <StepShell stepNo={4} title="한 가지 관점이 더 있어요">
        {notice && <p className="text-sm text-warn">{notice}</p>}
        <div className="mt-auto space-y-2 pt-6">
          <button
            type="button"
            disabled={isBusy}
            onClick={startChallenge}
            className="w-full rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-40"
          >
            다음 반론 보기
          </button>
          <button
            type="button"
            onClick={onDone}
            className="w-full py-2 text-center text-sm text-ink-soft underline"
          >
            여기까지 할게요
          </button>
        </div>
      </StepShell>
    );
  }

  return (
    <StepShell stepNo={4} title={challenge?.perspective ?? ""}>
      <div className="rounded-2xl border border-line bg-surface p-4">
        <p className="text-[15px] leading-relaxed">{challenge?.objection}</p>
      </div>

      {phase === "objection" && (
        <div className="mt-4">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="내 생각은…"
            className="min-h-32 w-full resize-none rounded-xl border border-line bg-surface p-3 text-[15px] outline-none focus:border-accent"
          />
          <button
            type="button"
            disabled={answer.trim().length === 0 || isBusy}
            onClick={submitAnswer}
            className="mt-3 w-full rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-40"
          >
            {isBusy ? "듣고 있어요…" : "답하기"}
          </button>
        </div>
      )}

      {phase === "reflect" && (
        <>
          <div className="mt-3 rounded-2xl bg-accent-soft p-4">
            <p className="text-sm text-accent">{reflectBack}</p>
          </div>
          <p className="mt-4 text-sm text-ink-soft">이 반론, 어떻게 마무리할까요?</p>
          <div className="mt-2 space-y-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => resolve("DEFENDED")}
              className="w-full rounded-xl border border-line bg-surface py-3 disabled:opacity-40"
            >
              방어했다 — 내 판단을 유지한다
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => resolve("REVISED")}
              className="w-full rounded-xl border border-line bg-surface py-3 disabled:opacity-40"
            >
              판단을 수정한다 — 구조로 돌아가기
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => resolve("DEFERRED")}
              className="w-full rounded-xl border border-line bg-surface py-3 disabled:opacity-40"
            >
              보류 — 나중에 다시 생각할래요
            </button>
          </div>
        </>
      )}
    </StepShell>
  );
}
