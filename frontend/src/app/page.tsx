"use client";

import Link from "next/link";
import { greeting } from "@/domains/decision/labels";
import { useDecisions, useReviewQueue } from "@/domains/decision/queries";
import RecallChips from "./_components/RecallChips";
import RecentDecisions from "./_components/RecentDecisions";
import ReviewQueueCard from "./_components/ReviewQueueCard";

export default function HomePage() {
  const { data: queue = [] } = useReviewQueue();
  const { data: decisions = [] } = useDecisions();
  const draft = decisions.find((d) => d.status === "DRAFT" && d.flowStep !== "DONE");

  return (
    <main className="space-y-6 px-5 pt-10">
      <header>
        <p className="text-sm text-ink-soft">{greeting()}</p>
        <h1 className="mt-1 text-xl font-bold">오늘 하루를 돌아볼까요?</h1>
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
        <h2 className="font-semibold">오늘 어떤 선택을 했나요?</h2>
        <p className="text-sm text-ink-soft">
          큰 결정이 아니어도 좋아요. 다시 생각해보고 싶은 순간이면 충분해요.
        </p>
        <RecallChips />
        <Link
          href="/write"
          className="block rounded-xl bg-accent py-3 text-center font-semibold text-white"
        >
          ✍️ 판단 기록하기
        </Link>
      </section>

      <RecentDecisions
        decisions={decisions}
        pendingReviews={queue.length}
      />
    </main>
  );
}
