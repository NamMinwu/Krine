"use client";

import { Calendar, Eye, Pencil } from "lucide-react";
import ComparisonTable from "@/app/_components/ComparisonTable";
import StepShell from "@/app/_components/StepShell";
import type { StructureDraft, StructureInput } from "@/domains/decision/types";
import { useStructureEditor } from "../_hooks/useStructureEditor";
import EditSheet from "./EditSheet";

export default function StructureStep({
  draft,
  isSaving,
  onSave,
}: {
  draft: StructureDraft;
  isSaving: boolean;
  onSave: (input: StructureInput) => void;
}) {
  const editor = useStructureEditor(draft);
  const { structure } = editor;

  return (
    <StepShell stepNo={3} title="제가 이해한 판단이 맞나요?">
      <p className="text-sm text-ink-soft">
        어긋난 부분은 눌러서 직접 고쳐주세요. 확정하면 이 카드는 잠기고, 이후엔 새 버전으로만 쌓여요.
      </p>

      <section className="mt-4 rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base font-bold">{structure.title}</h2>
          <button
            type="button"
            onClick={() => editor.beginEdit({ kind: "tag" })}
            className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent"
          >
            {structure.topicTag || "태그"}{" "}
            <Pencil size={11} className="inline" aria-hidden />
          </button>
        </div>
        <button
          type="button"
          onClick={() => editor.beginEdit({ kind: "situation" })}
          className="mt-2 w-full text-left text-sm text-ink-soft"
        >
          {structure.situation || "판단의 배경을 적어주세요"}{" "}
          <Pencil size={12} className="inline text-ink-soft" aria-hidden />
        </button>
      </section>

      <section className="mt-3 rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">판단 기준</h3>
          <button
            type="button"
            onClick={() => editor.beginEdit({ kind: "criteria" })}
            className="text-xs text-ink-soft"
          >
            <Pencil size={11} className="mr-0.5 inline" aria-hidden /> 수정
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {structure.criteria.map((criterion, index) => (
            <span
              key={index}
              className="rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent"
            >
              {criterion}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-line bg-surface p-4">
        <h3 className="text-sm font-semibold">선택지 비교</h3>
        <div className="mt-2">
          <ComparisonTable
            options={structure.options}
            onEditCell={(optionIndex, field) =>
              editor.beginEdit({ kind: "cell", optionIndex, field })
            }
            onEditLabel={(index) => editor.beginEdit({ kind: "optionLabel", index })}
          />
        </div>
        <button
          type="button"
          onClick={() => editor.beginEdit({ kind: "addOption" })}
          className="mt-3 w-full rounded-xl border border-dashed border-line py-2 text-sm text-ink-soft"
        >
          ＋ 선택지 추가
        </button>
      </section>

      <section className="mt-3 rounded-2xl border border-line bg-surface p-4">
        <h3 className="text-sm font-semibold">판단을 바꿀 조건</h3>
        <ul className="mt-2 space-y-2">
          {structure.conditions.map((condition, index) => (
            <li key={index} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => editor.toggleConditionType(index)}
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                  condition.type === "DATE"
                    ? "bg-accent-soft text-accent"
                    : "bg-warn-soft text-warn"
                }`}
              >
                {condition.type === "DATE" ? (
                  <>
                    <Calendar size={11} className="mr-0.5 inline" aria-hidden />
                    {condition.dueDate ?? "시점형"}
                  </>
                ) : (
                  <>
                    <Eye size={11} className="mr-0.5 inline" aria-hidden />
                    사건형
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => editor.beginEdit({ kind: "condition", index })}
                className="flex-1 text-left text-sm"
              >
                {condition.text}{" "}
                <Pencil size={12} className="inline text-ink-soft" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {structure.checkInDate && (
        <section className="mt-3 rounded-2xl border border-line bg-surface p-4">
          <h3 className="text-sm font-semibold">다시 볼 시점</h3>
          <p className="mt-1.5 text-sm">
            {structure.checkInDate}에 확인하러 올게요.
            <button
              type="button"
              onClick={editor.clearCheckInDate}
              className="ml-2 text-xs text-ink-soft underline"
            >
              취소
            </button>
          </p>
        </section>
      )}

      {editor.suggested && !structure.checkInDate && !editor.hasDateCondition && (
        <section className="mt-3 rounded-2xl border border-line bg-surface p-4">
          <h3 className="text-sm font-semibold">다시 볼 시점</h3>
          <p className="mt-1.5 text-sm text-ink-soft">
            {structure.conditions.length > 0
              ? `위 조건은 언제 일어날지 알 수 없어요. ${editor.suggested}에 조건이 생겼는지 확인하러 올까요?`
              : `판단을 바꿀 조건이 없다면, ${editor.suggested}에 이 판단이 여전히 유효한지 다시 볼까요?`}
          </p>
          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              onClick={editor.acceptSuggestedDate}
              className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white"
            >
              네, 확인해주세요
            </button>
            <button
              type="button"
              onClick={editor.dismissSuggested}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink-soft"
            >
              아니요
            </button>
          </div>
        </section>
      )}

      <button
        type="button"
        disabled={isSaving}
        onClick={() => onSave(structure)}
        className="mt-6 rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-40"
      >
        {isSaving ? "정리하고 있어요…" : "이대로 정리하기"}
      </button>

      {editor.editSheet && (
        <EditSheet
          {...editor.editSheet}
          onSave={editor.applyEdit}
          onClose={editor.cancelEdit}
        />
      )}
    </StepShell>
  );
}
