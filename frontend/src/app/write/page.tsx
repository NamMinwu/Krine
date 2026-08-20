"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { decisionApi } from "@/domains/decision/api";
import type {
  DiscoverResult,
  NextQuestion,
  StructureDraft,
  StructureInput,
} from "@/domains/decision/types";
import ObjectionStep from "@/app/_components/ObjectionStep";
import DiaryStep from "./_components/DiaryStep";
import DiscoverStep from "./_components/DiscoverStep";
import QuestionStep from "./_components/QuestionStep";
import ReflectionStep from "./_components/ReflectionStep";
import StepShell from "@/app/_components/StepShell";
import StructureStep from "./_components/StructureStep";

type Step =
  | "diary"
  | "discover"
  | "questions"
  | "structureLoading"
  | "structure"
  | "objection"
  | "reflection";

function WriteFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const seed = params.get("seed") ?? "";
  const resumeId = params.get("id");

  const [step, setStep] = useState<Step>("diary");
  const [decisionId, setDecisionId] = useState<number | null>(null);
  const [diaryText, setDiaryText] = useState(seed);
  const [discovered, setDiscovered] = useState<DiscoverResult | null>(null);
  const [question, setQuestion] = useState<NextQuestion | null>(null);
  const [structureDraft, setStructureDraft] = useState<StructureDraft | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isResuming, setIsResuming] = useState(Boolean(resumeId));

  // 이어서 하기: 서버에 저장된 flowStep에서 재개한다
  useEffect(() => {
    if (!resumeId) {
      return;
    }
    const id = Number(resumeId);
    decisionApi
      .get(id)
      .then((decision) => {
        setDecisionId(id);
        setDiaryText(decision.rawDiary ?? "");
        if (decision.flowStep === "QUESTIONS") {
          const lastQuestion = [...decision.messages]
            .reverse()
            .find((m) => m.role === "ASSISTANT" && m.choicesJson);
          const asked = decision.messages.filter(
            (m) => m.role === "ASSISTANT" && m.choicesJson,
          ).length;
          if (lastQuestion) {
            setQuestion({
              question: lastQuestion.content,
              choices: JSON.parse(lastQuestion.choicesJson ?? "[]") as string[],
              done: false,
              progress: asked,
              total: 4,
            });
            setStep("questions");
          } else {
            setStep("diary");
          }
        } else if (decision.flowStep === "STRUCTURE" || decision.flowStep === "OBJECTION") {
          void loadStructure(id);
        } else if (decision.flowStep === "DONE") {
          router.replace(`/decisions/${id}`);
        }
      })
      .finally(() => setIsResuming(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  const submitDiary = async (text: string) => {
    setIsBusy(true);
    setDiaryText(text);
    try {
      const decision = await decisionApi.createDraft(text);
      setDecisionId(decision.id);
      const result = await decisionApi.discover(decision.id);
      setDiscovered(result);
      setStep("discover");
    } finally {
      setIsBusy(false);
    }
  };

  const acceptDiscover = async () => {
    if (decisionId === null) {
      return;
    }
    setIsBusy(true);
    try {
      const next = await decisionApi.answer(decisionId, null);
      setQuestion(next);
      setStep(next.done ? "structureLoading" : "questions");
      if (next.done) {
        await loadStructure(decisionId);
      }
    } finally {
      setIsBusy(false);
    }
  };

  const submitAnswer = async (answer: string) => {
    if (decisionId === null) {
      return;
    }
    setIsBusy(true);
    try {
      const next = await decisionApi.answer(decisionId, answer);
      if (next.done) {
        await loadStructure(decisionId);
      } else {
        setQuestion(next);
      }
    } finally {
      setIsBusy(false);
    }
  };

  const loadStructure = async (id: number) => {
    setStep("structureLoading");
    const draft = await decisionApi.structureDraft(id);
    setStructureDraft(draft);
    setStep("structure");
  };

  const saveStructure = async (input: StructureInput) => {
    if (decisionId === null) {
      return;
    }
    setIsBusy(true);
    try {
      await decisionApi.saveStructure(decisionId, input);
      // 반박에서 "판단을 수정한다"로 돌아올 때를 위해 최신 구조를 유지
      setStructureDraft({ ...input, suggestedReviewDate: null });
      setStep("objection");
    } finally {
      setIsBusy(false);
    }
  };

  const confirm = async (conclusion: string, firstExpression: string) => {
    if (decisionId === null) {
      return;
    }
    setIsBusy(true);
    try {
      await decisionApi.confirm(decisionId, conclusion, firstExpression);
      router.replace(`/decisions/${decisionId}?confirmed=1`);
    } finally {
      setIsBusy(false);
    }
  };

  if (isResuming) {
    return (
      <StepShell stepNo={null} title="이어서 정리할게요">
        <p className="text-sm text-ink-soft">작성하던 판단을 불러오고 있어요…</p>
      </StepShell>
    );
  }

  switch (step) {
    case "diary":
      return (
        <DiaryStep initialText={diaryText} isSubmitting={isBusy} onSubmit={submitDiary} />
      );
    case "discover":
      return discovered ? (
        <DiscoverStep
          result={discovered}
          isSubmitting={isBusy}
          onAccept={acceptDiscover}
          onReject={() => setStep("diary")}
        />
      ) : null;
    case "questions":
      return question ? (
        <QuestionStep
          question={question}
          isSubmitting={isBusy}
          onAnswer={submitAnswer}
          onSkipAll={() => decisionId !== null && void loadStructure(decisionId)}
        />
      ) : null;
    case "structureLoading":
      return (
        <StepShell stepNo={3} title="판단을 정리하고 있어요…">
          <p className="text-sm text-ink-soft">
            대화에서 선택지·기준·전제·조건을 추리는 중이에요.
          </p>
        </StepShell>
      );
    case "structure":
      return structureDraft ? (
        <StructureStep draft={structureDraft} isSaving={isBusy} onSave={saveStructure} />
      ) : null;
    case "objection":
      return decisionId !== null ? (
        <ObjectionStep
          decisionId={decisionId}
          onRevise={() => setStep("structure")}
          onDone={() => setStep("reflection")}
        />
      ) : null;
    case "reflection":
      return (
        <ReflectionStep
          firstExpression={firstSentenceOf(diaryText)}
          defaultConclusion=""
          isSaving={isBusy}
          onConfirm={confirm}
        />
      );
  }
}

function firstSentenceOf(text: string): string {
  const sentence = text.split(/[.!?\n]/)[0]?.trim() ?? "";
  return sentence.length > 0 ? sentence : text.slice(0, 60);
}

export default function WritePage() {
  return (
    <Suspense>
      <WriteFlow />
    </Suspense>
  );
}
