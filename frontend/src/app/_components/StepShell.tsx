"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StepShell({
  stepNo,
  title,
  onBack,
  children,
}: {
  stepNo: number | null;
  title: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // 기록 플로우(stepNo 있음)에서 기본 뒤로가기 = 플로우 이탈 → 확인 모달.
  // onBack이 주어진 경우(스텝 간 내부 이동)나 stepNo가 없는 경우엔 그대로 동작.
  const handleBack =
    onBack ??
    (stepNo !== null
      ? () => setShowLeaveConfirm(true)
      : () => router.push("/"));

  return (
    <main className="flex min-h-dvh flex-col px-5 pb-8 pt-6">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="text-ink-soft"
          aria-label="뒤로"
        >
          ←
        </button>
        {stepNo !== null && (
          <span className="text-xs text-ink-soft">기록 {stepNo} / 5</span>
        )}
      </header>
      {stepNo !== null && (
        <div className="mt-3 h-1 w-full rounded-full bg-line">
          <div
            className="h-1 rounded-full bg-accent transition-all"
            style={{ width: `${(stepNo / 5) * 100}%` }}
          />
        </div>
      )}
      <h1 className="font-display animate-rise mt-6 text-xl font-semibold leading-snug">{title}</h1>
      <div className="animate-rise mt-4 flex flex-1 flex-col">{children}</div>

      {showLeaveConfirm && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 px-8"
          onClick={() => setShowLeaveConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-surface p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold">기록을 그만둘까요?</p>
            <p className="mt-1.5 text-sm text-ink-soft">
              지금 나가면 지금까지 적은 내용이 사라져요.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 rounded-xl bg-accent py-2.5 font-semibold text-white"
              >
                계속 쓸게요
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="flex-1 rounded-xl border border-line py-2.5 text-ink-soft"
              >
                나갈게요
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
