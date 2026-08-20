"use client";

import { useRouter } from "next/navigation";

const CHIPS = [
  "답장을 보냈다",
  "회의에서 의견을 골랐다",
  "구매를 고민했다",
  "일을 미뤘다",
] as const;

export default function RecallChips() {
  const router = useRouter();
  return (
    <div className="flex flex-wrap gap-2">
      {CHIPS.map((chip) => (
        <button
          key={chip}
          type="button"
          onClick={() => router.push(`/write?seed=${encodeURIComponent(chip)}`)}
          className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-soft"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
