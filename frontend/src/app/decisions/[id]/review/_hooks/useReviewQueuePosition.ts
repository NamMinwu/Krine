"use client";

import { useRouter } from "next/navigation";
import { useReviewQueue } from "@/domains/decision/queries";
import type { QueueKind } from "@/domains/decision/types";

// "한 번에 하나씩, 이어서" — 큐에서 현재 항목의 위치와 다음 항목 이동.
// 수동 진입(큐에 없는 항목)이면 index는 -1이고 goNext는 홈으로 간다.
export function useReviewQueuePosition(
  decisionId: number,
  kind: QueueKind | "MANUAL",
  refId: number | null,
) {
  const router = useRouter();
  const { data: queue = [] } = useReviewQueue();

  const index = queue.findIndex(
    (item) =>
      item.decisionId === decisionId && item.kind === kind && item.refId === refId,
  );

  const goNext = () => {
    if (index >= 0 && index + 1 < queue.length) {
      const next = queue[index + 1];
      router.push(
        `/decisions/${next.decisionId}/review?ref=${next.refId}&kind=${next.kind}`,
      );
    } else {
      router.push("/");
    }
  };

  return { index, total: queue.length, goNext };
}
