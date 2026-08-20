"use client";

import { useState } from "react";
import StepShell from "./StepShell";

export default function ReflectionStep({
  firstExpression,
  defaultConclusion,
  isSaving,
  onConfirm,
}: {
  firstExpression: string;
  defaultConclusion: string;
  isSaving: boolean;
  onConfirm: (conclusion: string, firstExpression: string) => void;
}) {
  const [conclusion, setConclusion] = useState(defaultConclusion);
  return (
    <StepShell stepNo={5} title="판단을 돌아봤어요">
      <div className="rounded-2xl border border-line bg-surface p-4">
        <p className="text-xs text-ink-soft">처음에는</p>
        <p className="mt-1 text-[15px]">“{firstExpression}”</p>
      </div>
      <div className="mt-3 rounded-2xl border border-accent/40 bg-accent-soft p-4">
        <p className="text-xs text-accent">지금은 이렇게 설명할 수 있어요</p>
        <textarea
          value={conclusion}
          onChange={(e) => setConclusion(e.target.value)}
          placeholder="…을 더 중요하게 평가했기 때문에 …한다"
          className="mt-2 min-h-24 w-full resize-none rounded-xl border border-line bg-surface p-3 text-[15px] outline-none focus:border-accent"
        />
      </div>
      <p className="mt-3 text-xs text-ink-soft">
        결론이 처음과 같아도 좋아요. 이유가 또렷해졌다면 그게 성공이에요.
      </p>
      <button
        type="button"
        disabled={conclusion.trim().length === 0 || isSaving}
        onClick={() => onConfirm(conclusion.trim(), firstExpression)}
        className="mt-auto rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-40"
      >
        {isSaving ? "저장하고 있어요…" : "판단 저장하기"}
      </button>
    </StepShell>
  );
}
