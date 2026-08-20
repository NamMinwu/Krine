"use client";

import { useState } from "react";
import type { NextQuestion } from "@/domains/decision/types";
import StepShell from "@/app/_components/StepShell";

export default function QuestionStep({
  question,
  isSubmitting,
  onAnswer,
  onSkipAll,
}: {
  question: NextQuestion;
  isSubmitting: boolean;
  onAnswer: (answer: string) => void;
  onSkipAll: () => void;
}) {
  const [custom, setCustom] = useState("");
  const choices = question.choices.filter((c) => c !== "직접 입력");
  return (
    <StepShell stepNo={2} title={question.question ?? ""}>
      <p className="text-xs text-ink-soft">
        {question.progress} / {question.total} · 떠오르는 대로 답해도 좋아요
      </p>
      <div className="mt-4 space-y-2">
        {choices.map((choice) => (
          <button
            key={choice}
            type="button"
            disabled={isSubmitting}
            onClick={() => onAnswer(choice)}
            className="w-full rounded-xl border border-line bg-surface py-3 text-[15px] disabled:opacity-40"
          >
            {choice}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <textarea
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="직접 입력…"
          className="min-h-20 w-full resize-none rounded-xl border border-line bg-surface p-3 text-[15px] outline-none focus:border-accent"
        />
        <button
          type="button"
          disabled={custom.trim().length === 0 || isSubmitting}
          onClick={() => onAnswer(custom.trim())}
          className="mt-2 w-full rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-40"
        >
          {isSubmitting ? "듣고 있어요…" : "답하기"}
        </button>
      </div>
      <button
        type="button"
        onClick={onSkipAll}
        className="mt-auto pt-4 text-center text-sm text-ink-soft underline"
      >
        여기까지만 답하고 정리할래요
      </button>
    </StepShell>
  );
}
