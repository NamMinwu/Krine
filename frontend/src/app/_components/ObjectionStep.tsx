"use client";

import { Swords } from "lucide-react";
import StepShell from "@/app/_components/StepShell";
import { useObjectionFlow } from "@/app/_hooks/useObjectionFlow";

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
  const flow = useObjectionFlow(decisionId, { onRevise, onDone });

  if (flow.phase === "intro") {
    return (
      <StepShell stepNo={stepNo} title="이 판단, 반박해볼까요?">
        {flow.notice && (
          <p className="mb-3 rounded-xl bg-warn-soft px-3 py-2 text-sm text-warn">
            {flow.notice}
          </p>
        )}
        <p className="text-sm text-ink-soft">
          확신할수록 의심해볼 가치가 있어요. 제가 전제를 반박하면, 재반박은
          당신의 몫입니다. 결론이 바뀌지 않아도 좋아요 — 이유가 또렷해지면
          성공이에요.
        </p>
        <div className="mt-auto space-y-2 pt-6">
          <button
            type="button"
            disabled={flow.isBusy}
            onClick={flow.start}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-40"
          >
            <Swords size={16} aria-hidden /> 반박 받기
          </button>
          <button
            type="button"
            onClick={flow.finish}
            className="w-full py-2 text-center text-sm text-ink-soft underline"
          >
            건너뛰어도 좋아요
          </button>
        </div>
      </StepShell>
    );
  }

  if (flow.phase === "resolving") {
    return (
      <StepShell stepNo={stepNo} title="반박을 이어갈까요?">
        {flow.notice && <p className="text-sm text-warn">{flow.notice}</p>}
        <div className="mt-auto space-y-2 pt-6">
          <button
            type="button"
            disabled={flow.isBusy}
            onClick={flow.start}
            className="w-full rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-40"
          >
            다른 반박 받기
          </button>
          <button
            type="button"
            onClick={flow.finish}
            className="w-full py-2 text-center text-sm text-ink-soft underline"
          >
            여기까지 할게요
          </button>
        </div>
      </StepShell>
    );
  }

  return (
    <StepShell stepNo={stepNo} title={flow.objection?.perspective ?? ""}>
      {flow.notice && (
        <p className="mb-3 rounded-xl bg-warn-soft px-3 py-2 text-sm text-warn">
          {flow.notice}
        </p>
      )}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <p className="text-[15px] leading-relaxed">{flow.objection?.objection}</p>
      </div>

      {flow.phase === "objection" && (
        <div className="mt-4">
          <textarea
            value={flow.answer}
            onChange={(e) => flow.setAnswer(e.target.value)}
            placeholder="내 생각은…"
            className="min-h-32 w-full resize-none rounded-xl border border-line bg-surface p-3 text-[15px] outline-none focus:border-accent"
          />
          <button
            type="button"
            disabled={flow.answer.trim().length === 0 || flow.isBusy}
            onClick={flow.submitAnswer}
            className="mt-3 w-full rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-40"
          >
            {flow.isBusy ? "듣고 있어요…" : "재반박하기"}
          </button>
        </div>
      )}

      {flow.phase === "reflect" && (
        <>
          <div className="mt-3 rounded-2xl bg-accent-soft p-4">
            <p className="text-sm text-accent">{flow.reflectBack}</p>
          </div>
          <p className="mt-4 text-sm text-ink-soft">이 반박, 어떻게 마무리할까요?</p>
          <div className="mt-2 space-y-2">
            <button
              type="button"
              disabled={flow.isBusy}
              onClick={() => flow.resolve("DEFENDED")}
              className="w-full rounded-xl border border-line bg-surface py-3 disabled:opacity-40"
            >
              방어했다 — 내 판단을 유지한다
            </button>
            <button
              type="button"
              disabled={flow.isBusy}
              onClick={() => flow.resolve("REVISED")}
              className="w-full rounded-xl border border-line bg-surface py-3 disabled:opacity-40"
            >
              판단을 수정한다 — 구조로 돌아가기
            </button>
            <button
              type="button"
              disabled={flow.isBusy}
              onClick={() => flow.resolve("DEFERRED")}
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
