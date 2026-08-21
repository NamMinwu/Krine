"use client";

// 사건형 조건 체크인 — "이 조건, 발생했나요?"
export default function CheckinPhase({
  title,
  conditionText,
  onOccurred,
  onNotYet,
}: {
  title: string;
  conditionText: string;
  onOccurred: () => void;
  onNotYet: () => void;
}) {
  return (
    <>
      <h1 className="font-display mt-6 text-xl font-semibold leading-snug">{title}</h1>
      <div className="mt-4 rounded-2xl border border-warn/30 bg-warn-soft p-4">
        <p className="text-sm">판단을 저장할 때 이렇게 적어두셨어요:</p>
        <p className="mt-2 font-medium">“{conditionText}”</p>
        <p className="mt-2 text-sm text-ink-soft">이 조건, 발생했나요?</p>
      </div>
      <div className="mt-auto space-y-2 pt-6">
        <button
          type="button"
          onClick={onOccurred}
          className="w-full rounded-xl bg-warn py-3 font-semibold text-white"
        >
          발생했어요 — 다시 판단할게요
        </button>
        <button
          type="button"
          onClick={onNotYet}
          className="w-full rounded-xl border border-line py-3 text-ink-soft"
        >
          아직이에요
        </button>
      </div>
    </>
  );
}
