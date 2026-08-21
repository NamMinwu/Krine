"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { decisionApi } from "@/domains/decision/api";
import { llmErrorNotice } from "@/domains/decision/labels";
import { useDecision } from "@/domains/decision/queries";
import type {
  Decision,
  NextQuestion,
  StructureDraft,
  StructureInput,
} from "@/domains/decision/types";

export type WriteStep =
  | "diary"
  | "discover"
  | "questions"
  | "structureLoading"
  | "structure"
  | "objection"
  | "reflection";

// 서버에 저장된 flowStep → 재개할 화면
function stepOf(decision: Decision | undefined): WriteStep | null {
  if (!decision) {
    return null;
  }
  switch (decision.flowStep) {
    case "QUESTIONS":
      return questionOf(decision) ? "questions" : "diary";
    case "STRUCTURE":
    case "OBJECTION":
      return "structureLoading";
    default:
      return "diary";
  }
}

// 서버에 저장된 대화 로그 → 마지막 질문 복원
function questionOf(decision: Decision | undefined): NextQuestion | null {
  if (!decision) {
    return null;
  }
  const asked = decision.messages.filter(
    (m) => m.role === "ASSISTANT" && m.choicesJson,
  );
  const last = asked[asked.length - 1];
  if (!last) {
    return null;
  }
  return {
    question: last.content,
    choices: JSON.parse(last.choicesJson ?? "[]") as string[],
    done: false,
    progress: asked.length,
    total: 4,
  };
}

export function useWriteFlow(seed: string, resumeId: number | null) {
  const router = useRouter();

  // 클라이언트 상태: 화면 전이 오버라이드, 사용자 입력, 안내 문구
  const [stepOverride, setStepOverride] = useState<WriteStep | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [diaryDraft, setDiaryDraft] = useState<string | null>(null);
  const [savedStructure, setSavedStructure] = useState<StructureInput | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // 이어서 하기: 서버 데이터는 쿼리로 가져오고 화면 상태는 파생한다
  const resume = useDecision(resumeId ?? Number.NaN);
  const resumeDecision = resumeId !== null ? resume.data : undefined;
  const decisionId = createdId ?? resumeDecision?.id ?? null;
  const diaryText = diaryDraft ?? resumeDecision?.rawDiary ?? seed;

  const startMutation = useMutation({
    mutationFn: async (text: string) => {
      const decision = await decisionApi.createDraft(text);
      const discovered = await decisionApi.discover(decision.id);
      return { decisionId: decision.id, discovered };
    },
    onSuccess: (result) => {
      setCreatedId(result.decisionId);
      setNotice(null);
      setStepOverride("discover");
    },
    onError: (e) => setNotice(llmErrorNotice(e)),
  });

  const structureDraftMutation = useMutation({
    mutationFn: (id: number) => decisionApi.structureDraft(id),
    onMutate: () => setStepOverride("structureLoading"),
    onSuccess: () => setStepOverride("structure"),
    onError: (e) => {
      setNotice(llmErrorNotice(e));
      setStepOverride("questions");
    },
  });

  const answerMutation = useMutation({
    mutationFn: (input: { id: number; answer: string | null }) =>
      decisionApi.answer(input.id, input.answer),
    onSuccess: (next, variables) => {
      if (next.done) {
        structureDraftMutation.mutate(variables.id);
      } else {
        setStepOverride("questions");
      }
    },
    onError: (e) => setNotice(llmErrorNotice(e)),
  });

  const saveStructureMutation = useMutation({
    mutationFn: (input: { id: number; structure: StructureInput }) =>
      decisionApi.saveStructure(input.id, input.structure),
    onSuccess: (_decision, variables) => {
      setNotice(null);
      // 반박에서 "판단을 수정한다"로 돌아올 때 최신 구조를 다시 보여주기 위함
      setSavedStructure(variables.structure);
      setStepOverride("objection");
    },
    onError: (e) => setNotice(llmErrorNotice(e)),
  });

  const confirmMutation = useMutation({
    mutationFn: (input: { id: number; conclusion: string; firstExpression: string }) =>
      decisionApi.confirm(input.id, input.conclusion, input.firstExpression),
    onSuccess: (_decision, variables) =>
      router.replace(`/decisions/${variables.id}?confirmed=1`),
    onError: (e) => setNotice(llmErrorNotice(e)),
  });

  // 재개 부수효과: 이미 확정된 판단이면 카드로, 구조 단계면 초안을 다시 생성
  const serverStep = stepOf(resumeDecision);
  useEffect(() => {
    if (resumeDecision?.flowStep === "DONE") {
      router.replace(`/decisions/${resumeDecision.id}`);
    }
  }, [resumeDecision, router]);
  useEffect(() => {
    if (
      serverStep === "structureLoading" &&
      decisionId !== null &&
      structureDraftMutation.status === "idle"
    ) {
      structureDraftMutation.mutate(decisionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverStep, decisionId]);

  // 서버 데이터의 파생값 — useState에 복사하지 않는다
  const step: WriteStep = stepOverride ?? serverStep ?? "diary";
  const discovered = startMutation.data?.discovered ?? null;
  const latestAnswer = answerMutation.data;
  const question =
    latestAnswer && !latestAnswer.done ? latestAnswer : questionOf(resumeDecision);
  const structureDraft: StructureDraft | null = savedStructure
    ? { ...savedStructure, suggestedReviewDate: null }
    : (structureDraftMutation.data ?? null);

  const isBusy =
    startMutation.isPending ||
    answerMutation.isPending ||
    saveStructureMutation.isPending ||
    confirmMutation.isPending;
  const isResuming = resumeId !== null && resume.isLoading;

  return {
    step,
    decisionId,
    diaryText,
    discovered,
    question,
    structureDraft,
    isBusy,
    isResuming,
    notice,
    clearNotice: () => setNotice(null),
    submitDiary: (text: string) => {
      setDiaryDraft(text);
      setNotice(null);
      startMutation.mutate(text);
    },
    acceptDiscover: () => {
      if (decisionId !== null) {
        answerMutation.mutate({ id: decisionId, answer: null });
      }
    },
    rejectDiscover: () => setStepOverride("diary"),
    submitAnswer: (answer: string) => {
      if (decisionId !== null) {
        answerMutation.mutate({ id: decisionId, answer });
      }
    },
    skipToStructure: () => {
      if (decisionId !== null) {
        structureDraftMutation.mutate(decisionId);
      }
    },
    saveStructure: (structure: StructureInput) => {
      if (decisionId !== null) {
        saveStructureMutation.mutate({ id: decisionId, structure });
      }
    },
    goRevise: () => setStepOverride("structure"),
    goReflection: () => setStepOverride("reflection"),
    confirm: (conclusion: string, firstExpression: string) => {
      if (decisionId !== null) {
        confirmMutation.mutate({ id: decisionId, conclusion, firstExpression });
      }
    },
  };
}
