"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { firstSentenceOf } from "@/domains/decision/labels";
import ObjectionStep from "@/app/_components/ObjectionStep";
import StepShell from "@/app/_components/StepShell";
import DiaryStep from "./_components/DiaryStep";
import DiscoverStep from "./_components/DiscoverStep";
import QuestionStep from "./_components/QuestionStep";
import ReflectionStep from "./_components/ReflectionStep";
import StructureStep from "./_components/StructureStep";
import { useWriteFlow } from "./_hooks/useWriteFlow";

function WriteFlow() {
  const params = useSearchParams();
  const seed = params.get("seed") ?? "";
  const resumeId = params.get("id") ? Number(params.get("id")) : null;

  const flow = useWriteFlow(seed, resumeId);

  if (flow.isResuming) {
    return (
      <StepShell stepNo={null} title="이어서 정리할게요">
        <p className="text-sm text-ink-soft">작성하던 판단을 불러오고 있어요…</p>
      </StepShell>
    );
  }

  return (
    <>
      {flow.notice && (
        <div className="fixed inset-x-0 top-0 z-30 mx-auto max-w-md px-4 pt-3">
          <div className="rounded-xl border border-warn/40 bg-warn-soft px-4 py-3 text-sm text-warn shadow-sm">
            {flow.notice}
            <button
              type="button"
              onClick={flow.clearNotice}
              className="ml-2 underline"
            >
              닫기
            </button>
          </div>
        </div>
      )}
      <WriteStepView flow={flow} />
    </>
  );
}

function WriteStepView({ flow }: { flow: ReturnType<typeof useWriteFlow> }) {
  switch (flow.step) {
    case "diary":
      return (
        <DiaryStep
          initialText={flow.diaryText}
          isSubmitting={flow.isBusy}
          onSubmit={flow.submitDiary}
        />
      );
    case "discover":
      return flow.discovered ? (
        <DiscoverStep
          result={flow.discovered}
          isSubmitting={flow.isBusy}
          onAccept={flow.acceptDiscover}
          onReject={flow.rejectDiscover}
        />
      ) : null;
    case "questions":
      return flow.question ? (
        <QuestionStep
          question={flow.question}
          isSubmitting={flow.isBusy}
          onAnswer={flow.submitAnswer}
          onSkipAll={flow.skipToStructure}
        />
      ) : null;
    case "structureLoading":
      return (
        <StepShell stepNo={3} title="판단을 정리하고 있어요…">
          <p className="text-sm text-ink-soft">
            대화에서 선택지·기준·조건을 추리는 중이에요.
          </p>
        </StepShell>
      );
    case "structure":
      return flow.structureDraft ? (
        <StructureStep
          draft={flow.structureDraft}
          isSaving={flow.isBusy}
          onSave={flow.saveStructure}
        />
      ) : null;
    case "objection":
      return flow.decisionId !== null ? (
        <ObjectionStep
          decisionId={flow.decisionId}
          onRevise={flow.goRevise}
          onDone={flow.goReflection}
        />
      ) : null;
    case "reflection":
      return (
        <ReflectionStep
          firstExpression={firstSentenceOf(flow.diaryText)}
          defaultConclusion=""
          isSaving={flow.isBusy}
          onConfirm={flow.confirm}
        />
      );
  }
}

export default function WritePage() {
  return (
    <Suspense>
      <WriteFlow />
    </Suspense>
  );
}
