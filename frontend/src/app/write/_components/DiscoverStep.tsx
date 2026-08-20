"use client";

import type { DiscoverResult } from "@/domains/decision/types";
import StepShell from "@/app/_components/StepShell";

export default function DiscoverStep({
  result,
  isSubmitting,
  onAccept,
  onReject,
}: {
  result: DiscoverResult;
  isSubmitting: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <StepShell stepNo={1} title="이야기 속에서 판단을 발견했어요" onBack={onReject}>
      <div className="rounded-2xl border border-line bg-surface p-4">
        <p className="text-sm text-ink-soft">{result.message}</p>
        <p className="mt-3 text-lg font-bold">{result.title}</p>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="rounded-lg bg-accent-soft px-3 py-1.5 font-medium text-accent">
            {result.optionA}
          </span>
          <span className="text-ink-soft">vs</span>
          <span className="rounded-lg bg-accent-soft px-3 py-1.5 font-medium text-accent">
            {result.optionB}
          </span>
        </div>
      </div>
      <div className="mt-auto space-y-2 pt-6">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onAccept}
          className="w-full rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-40"
        >
          좋아요, 정리해볼게요
        </button>
        <button
          type="button"
          onClick={onReject}
          className="w-full rounded-xl border border-line py-3 text-ink-soft"
        >
          아니요, 다시 쓸게요
        </button>
      </div>
    </StepShell>
  );
}
