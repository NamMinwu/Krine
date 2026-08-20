"use client";

import Link from "next/link";
import { QUEUE_KIND_LABELS } from "@/domains/decision/labels";
import type { ReviewQueueItem } from "@/domains/decision/types";

export default function ReviewQueueCard({ items }: { items: ReviewQueueItem[] }) {
  if (items.length === 0) {
    return null;
  }
  const first = items[0];
  return (
    <section className="rounded-2xl border border-warn/30 bg-warn-soft p-4">
      <p className="text-sm font-semibold text-warn">
        🔔 재검토가 도착했어요 ({items.length})
      </p>
      <div className="mt-3 rounded-xl bg-surface p-3">
        <p className="font-medium">{first.decisionTitle}</p>
        <p className="mt-1 text-sm text-ink-soft">
          “{first.text}” — {QUEUE_KIND_LABELS[first.kind]}
        </p>
        <Link
          href={`/decisions/${first.decisionId}/review?ref=${first.refId}&kind=${first.kind}`}
          className="mt-3 block rounded-lg bg-warn py-2 text-center text-sm font-semibold text-white"
        >
          다시 보기
        </Link>
      </div>
      {items.length > 1 && (
        <p className="mt-2 text-xs text-ink-soft">
          한 번에 하나씩 살펴봐요. 나머지 {items.length - 1}건은 이어서 보여드릴게요.
        </p>
      )}
    </section>
  );
}
