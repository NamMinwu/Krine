"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { decisionApi } from "./api";
import type { ReviewInput, StructureInput } from "./types";

const KEYS = {
  decisions: ["decisions"] as const,
  decision: (id: number) => ["decisions", id] as const,
  reviewQueue: ["review-queue"] as const,
};

export function useDecisions() {
  return useQuery({ queryKey: KEYS.decisions, queryFn: decisionApi.list });
}

export function useDecision(id: number) {
  return useQuery({
    queryKey: KEYS.decision(id),
    queryFn: () => decisionApi.get(id),
    enabled: Number.isFinite(id),
  });
}

export function useReviewQueue() {
  return useQuery({ queryKey: KEYS.reviewQueue, queryFn: decisionApi.reviewQueue });
}

function useInvalidateAll() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: KEYS.decisions });
    void queryClient.invalidateQueries({ queryKey: KEYS.reviewQueue });
  };
}

export function useSaveStructure(id: number) {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (input: StructureInput) => decisionApi.saveStructure(id, input),
    onSuccess: invalidate,
  });
}

export function useConfirm(id: number) {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (input: { conclusion: string; firstExpression: string | null }) =>
      decisionApi.confirm(id, input.conclusion, input.firstExpression),
    onSuccess: invalidate,
  });
}

export function useReview(id: number) {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (input: ReviewInput) => decisionApi.review(id, input),
    onSuccess: invalidate,
  });
}
