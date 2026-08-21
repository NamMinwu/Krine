import { LlmBusyError } from "./api";
import type { QueueKind, Verdict } from "./types";

export type ReviewVerdict = Exclude<Verdict, "INITIAL">;

export const REVIEW_VERDICT_OPTIONS: {
  key: ReviewVerdict;
  label: string;
  hint: string;
}[] = [
  { key: "MAINTAINED", label: "유지", hint: "당시 판단이 여전히 맞아요" },
  { key: "REVISED", label: "수정", hint: "결론을 다듬어야겠어요" },
  { key: "REVERSED", label: "뒤집음", hint: "반대 결론으로 바꿔요" },
];

// LLM 호출 실패 시 사용자 안내 문구 — 대화가 서버에 저장되어 있음을 함께 알린다
export function llmErrorNotice(e: unknown): string {
  return e instanceof LlmBusyError
    ? "AI가 잠시 붐비고 있어요. 쓰신 내용은 저장되어 있으니, 잠시 후 같은 버튼을 다시 눌러주세요."
    : "일시적인 오류가 있었어요. 쓰신 내용은 저장되어 있으니 다시 시도해주세요.";
}

// Reflection에서 "처음 표현"으로 보여줄 일기의 첫 문장
export function firstSentenceOf(text: string): string {
  const sentence = text.split(/[.!?\n]/)[0]?.trim() ?? "";
  return sentence.length > 0 ? sentence : text.slice(0, 60);
}

export const VERDICT_LABELS: Record<Verdict, { label: string; icon: string; className: string }> = {
  INITIAL: { label: "확정", icon: "✓", className: "bg-accent-soft text-accent" },
  MAINTAINED: { label: "유지", icon: "✓", className: "bg-accent-soft text-accent" },
  REVISED: { label: "수정됨", icon: "↻", className: "bg-warn-soft text-warn" },
  REVERSED: { label: "뒤집음", icon: "⤴", className: "bg-warn-soft text-warn" },
};

export const OBJECTION_RESOLUTION_LABELS: Record<string, string> = {
  DEFENDED: "방어함",
  REVISED: "판단 수정",
  DEFERRED: "보류 — 재검토 대기",
  OPEN: "진행 중",
};

export const QUEUE_KIND_LABELS: Record<QueueKind, string> = {
  CHECK_IN: "확인하기로 한 날이 되었어요",
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
