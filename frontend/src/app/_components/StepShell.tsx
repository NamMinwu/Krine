"use client";

import { useRouter } from "next/navigation";

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
  return (
    <main className="flex min-h-dvh flex-col px-5 pb-8 pt-6">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack ?? (() => router.push("/"))}
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
    </main>
  );
}
