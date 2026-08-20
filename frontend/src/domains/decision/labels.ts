import type { QueueKind, Verdict } from "./types";

export const VERDICT_LABELS: Record<Verdict, { label: string; icon: string; className: string }> = {
  INITIAL: { label: "확정", icon: "✓", className: "bg-accent-soft text-accent" },
  MAINTAINED: { label: "유지", icon: "✓", className: "bg-accent-soft text-accent" },
  REVISED: { label: "수정됨", icon: "↻", className: "bg-warn-soft text-warn" },
  REVERSED: { label: "뒤집음", icon: "⤴", className: "bg-warn-soft text-warn" },
};

export const QUEUE_KIND_LABELS: Record<QueueKind, string> = {
  DUE_DATE: "설정한 날이 되었어요",
  EVENT_CHECKIN: "이 조건, 발생했나요?",
  DEFERRED_OBJECTION: "그때 답 못 한 반박이 있어요",
};

export function relativeTime(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) {
    return "오늘";
  }
  if (days < 30) {
    return `${days}일 전`;
  }
  return `${Math.floor(days / 30)}개월 전`;
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "좋은 아침이에요.";
  }
  if (hour < 18) {
    return "좋은 오후예요.";
  }
  return "좋은 저녁이에요.";
}
