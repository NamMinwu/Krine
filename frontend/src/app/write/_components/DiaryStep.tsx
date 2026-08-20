"use client";

import { useState } from "react";
import StepShell from "@/app/_components/StepShell";

export default function DiaryStep({
  initialText,
  isSubmitting,
  onSubmit,
}: {
  initialText: string;
  isSubmitting: boolean;
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState(initialText);
  return (
    <StepShell stepNo={1} title="오늘 어떤 선택을 했나요?">
      <p className="text-sm text-ink-soft">
        있었던 일을 자유롭게 적어보세요. 그 안의 판단은 제가 찾아볼게요.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="오늘 회의에서 기존 방식 그대로 가기로 했다. 사실 새로운 방식도 괜찮아 보였는데 일정 때문에…"
        className="mt-4 min-h-44 flex-1 resize-none rounded-xl border border-line bg-surface p-4 text-[15px] leading-relaxed outline-none focus:border-accent"
      />
      <button
        type="button"
        disabled={text.trim().length < 5 || isSubmitting}
        onClick={() => onSubmit(text.trim())}
        className="mt-4 rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-40"
      >
        {isSubmitting ? "판단을 찾고 있어요…" : "계속"}
      </button>
    </StepShell>
  );
}
