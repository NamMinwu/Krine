"use client";

import { useState } from "react";
import { llmErrorNotice } from "@/domains/decision/labels";
import {
  useAnswerObjection,
  useCreateObjection,
  useResolveObjection,
} from "@/domains/decision/queries";
import type { ObjectionResolution } from "@/domains/decision/types";

export type ObjectionPhase = "intro" | "objection" | "reflect" | "resolving";

// 반박·재반박 루프의 상태 오케스트레이션.
// 서버 데이터(반박·되비추기)는 mutation 결과의 파생값으로 다룬다.
export function useObjectionFlow(
  decisionId: number,
  handlers: { onRevise: () => void; onDone: () => void },
) {
  const [phase, setPhase] = useState<ObjectionPhase>("intro");
  const [answer, setAnswer] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const createObjection = useCreateObjection(decisionId);
  const answerObjection = useAnswerObjection();
  const resolveObjection = useResolveObjection();

  const objection = createObjection.data ?? null;
  const reflectBack = answerObjection.data?.reflectBack ?? null;
  const isBusy =
    createObjection.isPending ||
    answerObjection.isPending ||
    resolveObjection.isPending;

  const start = () => {
    createObjection.mutate(undefined, {
      onSuccess: () => {
        setAnswer("");
        answerObjection.reset(); // 이전 반박의 되비추기가 새 반박에 남지 않도록
        setNotice(null);
        setPhase("objection");
      },
      onError: (e) => setNotice(llmErrorNotice(e)),
    });
  };

  const submitAnswer = () => {
    if (!objection) {
      return;
    }
    answerObjection.mutate(
      { objectionId: objection.objectionId, answer: answer.trim() },
      {
        onSuccess: () => setPhase("reflect"),
        onError: (e) => setNotice(llmErrorNotice(e)),
      },
    );
  };

  const resolve = (resolution: Exclude<ObjectionResolution, "OPEN">) => {
    if (!objection) {
      return;
    }
    resolveObjection.mutate(
      { objectionId: objection.objectionId, resolution },
      {
        onSuccess: () => {
          if (resolution === "REVISED") {
            handlers.onRevise();
            return;
          }
          if (resolution === "DEFERRED") {
            setNotice("이 반박은 보류로 저장했어요. 재검토 때 다시 만나요.");
          }
          setPhase("resolving");
        },
        onError: (e) => setNotice(llmErrorNotice(e)),
      },
    );
  };

  return {
    phase,
    objection,
    reflectBack,
    answer,
    setAnswer,
    notice,
    isBusy,
    start,
    submitAnswer,
    resolve,
    finish: handlers.onDone,
  };
}
