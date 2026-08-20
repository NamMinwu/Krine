"use client";

import { useState } from "react";
import { Swords } from "lucide-react";
import { decisionApi } from "@/domains/decision/api";
import type { ObjectionResult } from "@/domains/decision/types";
import StepShell from "@/app/_components/StepShell";

const BUSY_NOTICE =
  "AI가 잠시 붐비고 있어요. 답변은 저장되어 있으니, 잠시 후 같은 버튼을 다시 눌러주세요.";

type Phase = "intro" | "objection" | "reflect" | "resolving";

export default function ObjectionStep({
  decisionId,
  stepNo = 4,
  onRevise,
  onDone,
}: {
  decisionId: number;
  stepNo?: number | null;
  onRevise: () => void;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [objection, setObjection] = useState<ObjectionResult | null>(null);
  const [answer, setAnswer] = useState("");
  const [reflectBack, setReflectBack] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const startObjection = async () => {
    setIsBusy(true);
    try {
      const result = await decisionApi.objection(decisionId);
      setObjection(result);
      setAnswer("");
      setReflectBack("");
      setNotice(null);
      setPhase("objection");
    } catch {
      setNotice(BUSY_NOTICE);
    } finally {
      setIsBusy(false);
    }
  };

  const submitAnswer = async () => {
    if (!objection) {
      return;
    }
    setIsBusy(true);
    try {
      const result = await decisionApi.answerObjection(objection.objectionId, answer.trim());
      setReflectBack(result.reflectBack);
      setPhase("reflect");
    } catch {
      setNotice(BUSY_NOTICE);
    } finally {
      setIsBusy(false);
    }
  };

  const resolve = async (resolution: "DEFENDED" | "REVISED" | "DEFERRED") => {
    if (!objection) {
      return;
    }
    setIsBusy(true);
    try {
      await decisionApi.resolveObjection(objection.objectionId, resolution);
      if (resolution === "REVISED") {
        onRevise();
        return;
      }
      if (resolution === "DEFERRED") {
        setNotice("이 반론은 보류로 저장했어요. 재검토 때 다시 만나요.");
      }
      if (objection.remaining > 0) {
        setPhase("resolving");
      } else {
        onDone();
      }
    } catch {
      setNotice(BUSY_NOTICE);
    } finally {
      setIsBusy(false);
    }
  };

  if (phase === "intro") {
    return (
      <StepShell stepNo={stepNo} title="다른 관점에서 검토해볼까요?">
        {notice && <p className="mb-3 rounded-xl bg-warn-soft px-3 py-2 text-sm text-warn">{notice}</p>}
        <p className="text-sm text-ink-soft">
          제가 반론을 하나씩 던질게요. 답은 당신이 씁니다. 결론이 바뀌지 않아도
          좋아요 — 판단의 이유가 또렷해지는 것이 목적이에요.
        </p>
        <div className="mt-auto space-y-2 pt-6">
          <button
            type="button"
            disabled={isBusy}
            onClick={startObjection}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-40"
          >
            <Swords size={16} aria-hidden /> 다른 관점에서 검토해보기
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
      <StepShell stepNo={stepNo} title="한 가지 관점이 더 있어요">
        {notice && <p className="text-sm text-warn">{notice}</p>}
        <div className="mt-auto space-y-2 pt-6">
          <button
            type="button"
            disabled={isBusy}
            onClick={startObjection}
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
    <StepShell stepNo={stepNo} title={objection?.perspective ?? ""}>
      {notice && <p className="mb-3 rounded-xl bg-warn-soft px-3 py-2 text-sm text-warn">{notice}</p>}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <p className="text-[15px] leading-relaxed">{objection?.objection}</p>
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
