"use client";

import { useState } from "react";
import type {
  ConditionInput,
  StructureDraft,
  StructureInput,
} from "@/domains/decision/types";
import ComparisonTable, { type OptionField } from "@/app/_components/ComparisonTable";
import EditSheet from "./EditSheet";
import StepShell from "@/app/_components/StepShell";

type EditTarget =
  | { kind: "situation" }
  | { kind: "tag" }
  | { kind: "criteria" }
  | { kind: "cell"; optionIndex: number; field: OptionField }
  | { kind: "condition"; index: number };

export default function StructureStep({
  draft,
  isSaving,
  onSave,
}: {
  draft: StructureDraft;
  isSaving: boolean;
  onSave: (input: StructureInput) => void;
}) {
  const [structure, setStructure] = useState<StructureInput>({
    title: draft.title,
    situation: draft.situation,
    topicTag: draft.topicTag,
    criteria: draft.criteria,
    options: draft.options,
    conditions: draft.conditions,
  });
  const [suggested, setSuggested] = useState(draft.suggestedReviewDate);
  const [editing, setEditing] = useState<EditTarget | null>(null);

  const hasDateCondition = structure.conditions.some((c) => c.type === "DATE");

  const acceptSuggestedDate = () => {
    if (!suggested) {
      return;
    }
    setStructure((s) => ({
      ...s,
      conditions: [
        ...s.conditions,
        { text: "정기 재검토", type: "DATE", dueDate: suggested },
      ],
    }));
    setSuggested(null);
  };

  const editValue = (): { title: string; value: string; hint?: string } => {
    if (!editing) {
      return { title: "", value: "" };
    }
    switch (editing.kind) {
      case "situation":
        return { title: "판단의 배경", value: structure.situation ?? "" };
      case "tag":
        return { title: "주제 태그", value: structure.topicTag ?? "", hint: "한 단어로 (예: 업무, 건강, 소비)" };
      case "criteria":
        return {
          title: "판단 기준",
          value: structure.criteria.join("\n"),
          hint: "한 줄에 하나씩 적어주세요",
        };
      case "cell": {
        const option = structure.options[editing.optionIndex];
        return {
          title: `${option.label} — 수정`,
          value: option[editing.field].join("\n"),
          hint: "한 줄에 하나씩 적어주세요",
        };
      }
      case "condition":
        return {
          title: "판단을 바꿀 조건",
          value: structure.conditions[editing.index].text,
        };
    }
  };

  const applyEdit = (value: string) => {
    if (!editing) {
      return;
    }
    const lines = value.split("\n").map((l) => l.trim()).filter(Boolean);
    setStructure((s) => {
      switch (editing.kind) {
        case "situation":
          return { ...s, situation: value.trim() };
        case "tag":
          return { ...s, topicTag: value.trim() };
        case "criteria":
          return { ...s, criteria: lines };
        case "cell": {
          const options = s.options.map((o, i) =>
            i === editing.optionIndex ? { ...o, [editing.field]: lines } : o,
          );
          return { ...s, options };
        }
        case "condition": {
          const conditions = s.conditions.map((c, i) =>
            i === editing.index ? { ...c, text: value.trim() } : c,
          );
          return { ...s, conditions };
        }
      }
    });
    setEditing(null);
  };

  const toggleConditionType = (index: number) => {
    setStructure((s) => ({
      ...s,
      conditions: s.conditions.map((c, i): ConditionInput => {
        if (i !== index) {
          return c;
        }
        return c.type === "DATE"
          ? { ...c, type: "EVENT", dueDate: null }
          : { ...c, type: "DATE", dueDate: suggestedOrMonthLater() };
      }),
    }));
  };

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
            onClick={() => setEditing({ kind: "tag" })}
            className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent"
          >
            {structure.topicTag || "태그"} ✏️
          </button>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ kind: "situation" })}
          className="mt-2 w-full text-left text-sm text-ink-soft"
        >
          {structure.situation || "판단의 배경을 적어주세요"} ✏️
        </button>
      </section>

      <section className="mt-3 rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">판단 기준</h3>
          <button
            type="button"
            onClick={() => setEditing({ kind: "criteria" })}
            className="text-xs text-ink-soft"
          >
            ✏️ 수정
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {structure.criteria.map((c) => (
            <span key={c} className="rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent">
              {c}
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
              setEditing({ kind: "cell", optionIndex, field })
            }
          />
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-line bg-surface p-4">
        <h3 className="text-sm font-semibold">판단을 바꿀 조건</h3>
        <ul className="mt-2 space-y-2">
          {structure.conditions.map((condition, index) => (
            <li key={`${condition.text}-${index}`} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleConditionType(index)}
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                  condition.type === "DATE"
                    ? "bg-accent-soft text-accent"
                    : "bg-warn-soft text-warn"
                }`}
              >
                {condition.type === "DATE"
                  ? `📅 ${condition.dueDate ?? "시점형"}`
                  : "👀 사건형"}
              </button>
              <button
                type="button"
                onClick={() => setEditing({ kind: "condition", index })}
                className="flex-1 text-left text-sm"
              >
                {condition.text} ✏️
              </button>
            </li>
          ))}
        </ul>
        {suggested && !hasDateCondition && (
          <div className="mt-3 rounded-xl bg-accent-soft p-3 text-sm">
            <p>따로 정한 시점이 없다면, {suggested}에 이 판단을 다시 볼까요?</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={acceptSuggestedDate}
                className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white"
              >
                좋아요
              </button>
              <button
                type="button"
                onClick={() => setSuggested(null)}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-ink-soft"
              >
                괜찮아요
              </button>
            </div>
          </div>
        )}
      </section>

      <button
        type="button"
        disabled={isSaving}
        onClick={() => onSave(structure)}
        className="mt-6 rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-40"
      >
        {isSaving ? "정리하고 있어요…" : "이대로 정리하기"}
      </button>

      {editing && (
        <EditSheet
          {...editValue()}
          onSave={applyEdit}
          onClose={() => setEditing(null)}
        />
      )}
    </StepShell>
  );
}

function suggestedOrMonthLater(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}
