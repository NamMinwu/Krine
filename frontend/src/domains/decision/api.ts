import type {
  ObjectionResult,
  Decision,
  DecisionSummary,
  DiscoverResult,
  NextQuestion,
  ReviewInput,
  ReviewQueueItem,
  StructureDraft,
  StructureInput,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface Envelope<T> {
  success: boolean;
  data: T;
  error: string | null;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const envelope = (await response.json()) as Envelope<T>;
  if (!response.ok || !envelope.success) {
    throw new Error(envelope.error ?? "요청에 실패했습니다");
  }
  return envelope.data;
}

export const decisionApi = {
  createDraft: (rawDiary: string) =>
    apiFetch<Decision>("/api/decisions", {
      method: "POST",
      body: JSON.stringify({ rawDiary }),
    }),
  discover: (id: number) =>
    apiFetch<DiscoverResult>(`/api/decisions/${id}/discover`, { method: "POST" }),
  answer: (id: number, answer: string | null) =>
    apiFetch<NextQuestion>(`/api/decisions/${id}/answer`, {
      method: "POST",
      body: JSON.stringify({ answer }),
    }),
  structureDraft: (id: number) =>
    apiFetch<StructureDraft>(`/api/decisions/${id}/structure/draft`, {
      method: "POST",
    }),
  saveStructure: (id: number, input: StructureInput) =>
    apiFetch<Decision>(`/api/decisions/${id}/structure`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  confirm: (id: number, conclusion: string, firstExpression: string | null) =>
    apiFetch<Decision>(`/api/decisions/${id}/confirm`, {
      method: "POST",
      body: JSON.stringify({ conclusion, firstExpression }),
    }),
  objection: (id: number) =>
    apiFetch<ObjectionResult>(`/api/decisions/${id}/objection`, { method: "POST" }),
  answerObjection: (objectionId: number, answer: string) =>
    apiFetch<{ reflectBack: string }>(`/api/objections/${objectionId}/answer`, {
      method: "POST",
      body: JSON.stringify({ answer }),
    }),
  resolveObjection: (objectionId: number, resolution: string) =>
    apiFetch<Decision>(`/api/objections/${objectionId}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolution }),
    }),
  list: () => apiFetch<DecisionSummary[]>("/api/decisions"),
  get: (id: number) => apiFetch<Decision>(`/api/decisions/${id}`),
  reviewQueue: () => apiFetch<ReviewQueueItem[]>("/api/review-queue"),
  review: (id: number, input: ReviewInput) =>
    apiFetch<Decision>(`/api/decisions/${id}/review`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
