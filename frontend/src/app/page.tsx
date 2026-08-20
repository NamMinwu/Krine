"use client";

import Link from "next/link";
import { greeting } from "@/domains/decision/labels";
import { useDecisions, useReviewQueue } from "@/domains/decision/queries";
import RecallChips from "./_components/RecallChips";
import ReviewQueueCard from "./_components/ReviewQueueCard";

export default function HomePage() {
  const { data: queue = [] } = useReviewQueue();
  const { data: decisions = [] } = useDecisions();
  const draft = decisions.find((d) => d.status === "DRAFT" && d.flowStep !== "DONE");
  const activeCount = decisions.filter((d) => d.status === "ACTIVE").length;

  return (
    <main className="space-y-6 px-5 pt-12">
      <header>
        <p className="text-sm text-ink-soft">{greeting()}</p>
        <h1 className="mt-1 text-xl font-bold">오늘 어떤 선택을 했나요?</h1>
      </header>

      <ReviewQueueCard items={queue} />

      {draft && (
        <Link
          href={`/write?id=${draft.id}`}
          className="block rounded-2xl border border-line bg-surface p-4"
        >
          <p className="text-sm text-ink-soft">작성 중인 판단이 있어요</p>
          <p className="mt-1 font-medium">
            {draft.title ?? "이어서 정리해볼까요?"} →
          </p>
        </Link>
      )}

      <section className="space-y-3">
        <RecallChips />
        <Link
          href="/write"
          className="block rounded-xl bg-accent py-3 text-center font-semibold text-white"
        >
          ✍️ 판단 기록하기
        </Link>
      </section>

      {activeCount > 0 && (
        <Link
          href="/archive"
          className="block text-center text-sm text-ink-soft underline underline-offset-4"
        >
          내 판단 {activeCount}개 모아보기
        </Link>
      )}
    </main>
  );
}
