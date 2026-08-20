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
          <span className="text-xs text-ink-soft">{stepNo} / 5</span>
        )}
      </header>
      <h1 className="animate-rise mt-6 text-lg font-bold leading-snug">{title}</h1>
      <div className="animate-rise mt-4 flex flex-1 flex-col">{children}</div>
    </main>
  );
}
