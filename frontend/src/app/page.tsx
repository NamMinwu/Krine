"use client";

import Link from "next/link";
import { greeting } from "@/domains/decision/labels";
import { useDecisions, useReviewQueue } from "@/domains/decision/queries";
import RecallChips from "./_components/RecallChips";
import ReviewQueueCard from "./_components/ReviewQueueCard";

export default function HomePage() {
  const { data: queue = [] } = useReviewQueue();
  const { data: decisions = [] } = useDecisions();
  const activeCount = decisions.filter((d) => d.status === "ACTIVE").length;

  return (
    <main className="space-y-6 px-5 pt-12">
      <header>
        <p className="text-sm text-ink-soft">{greeting()}</p>
        <h1 className="mt-1 text-xl font-bold">오늘 어떤 선택을 했나요?</h1>
      </header>

      <ReviewQueueCard items={queue} />

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
