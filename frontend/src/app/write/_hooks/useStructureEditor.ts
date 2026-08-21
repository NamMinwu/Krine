"use client";

import { useState } from "react";
import type { OptionField } from "@/app/_components/ComparisonTable";
import type {
  ConditionInput,
  StructureDraft,
  StructureInput,
} from "@/domains/decision/types";

export type EditTarget =
  | { kind: "situation" }
  | { kind: "tag" }
  | { kind: "addOption" }
  | { kind: "optionLabel"; index: number }
  | { kind: "criteria" }
  | { kind: "cell"; optionIndex: number; field: OptionField }
  | { kind: "condition"; index: number };

function monthLater(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

// 구조화 화면의 편집 상태 전이 — LLM 초안을 사용자의 작업본으로 다듬는 미니 리듀서.
// draft는 서버 캐시가 아니라 사용자가 수정해 저장할 초안이므로 로컬 상태로 복사한다.
export function useStructureEditor(draft: StructureDraft) {
  const [structure, setStructure] = useState<StructureInput>({
    title: draft.title,
    situation: draft.situation,
    topicTag: draft.topicTag,
    criteria: draft.criteria,
    options: draft.options,
    conditions: draft.conditions,
    checkInDate: null,
  });
  const [suggested, setSuggested] = useState(draft.suggestedReviewDate);
  const [editing, setEditing] = useState<EditTarget | null>(null);

  const hasDateCondition = structure.conditions.some((c) => c.type === "DATE");

  // 편집 시트에 띄울 제목·현재 값
  const editSheet = editing
    ? (() => {
        switch (editing.kind) {
          case "situation":
            return { title: "판단의 배경", value: structure.situation ?? "" };
          case "tag":
            return {
              title: "주제 태그",
              value: structure.topicTag ?? "",
              hint: "한 단어로 (예: 업무, 건강, 소비)",
            };
          case "addOption":
            return {
              title: "선택지 추가",
              value: "",
              hint: "고민했던 다른 길의 이름 (예: 도입하지 않는다)",
            };
          case "optionLabel":
            return { title: "선택지 이름", value: structure.options[editing.index].label };
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
      })()
    : null;

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
        case "addOption": {
          const label = value.trim();
          if (!label) {
            return s;
          }
          return { ...s, options: [...s.options, { label, gains: [], sacrifices: [] }] };
        }
        case "optionLabel": {
          const options = s.options.map((o, i) =>
            i === editing.index ? { ...o, label: value.trim() } : o,
          );
          return { ...s, options };
        }
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
          : { ...c, type: "DATE", dueDate: suggested ?? monthLater() };
      }),
    }));
  };

  const acceptSuggestedDate = () => {
    if (!suggested) {
      return;
    }
    // 조건이 아니라 '확인 약속'으로 저장한다 — 조건 리스트에 섞이지 않는다
    setStructure((s) => ({ ...s, checkInDate: suggested }));
    setSuggested(null);
  };

  return {
    structure,
    suggested,
    hasDateCondition,
    editing,
    editSheet,
    beginEdit: setEditing,
    cancelEdit: () => setEditing(null),
    applyEdit,
    toggleConditionType,
    acceptSuggestedDate,
    dismissSuggested: () => setSuggested(null),
    clearCheckInDate: () => setStructure((s) => ({ ...s, checkInDate: null })),
  };
}
