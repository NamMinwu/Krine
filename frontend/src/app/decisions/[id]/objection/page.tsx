"use client";

import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import ObjectionStep from "@/app/_components/ObjectionStep";

export default function ObjectionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const decisionId = Number(params.id);

  const finish = (path: string) => {
    void queryClient.invalidateQueries();
    router.push(path);
  };

  return (
    <ObjectionStep
      decisionId={decisionId}
      stepNo={null}
      onRevise={() => finish(`/decisions/${decisionId}/review`)}
      onDone={() => finish(`/decisions/${decisionId}`)}
    />
  );
}
