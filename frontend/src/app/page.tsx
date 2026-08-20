"use client";

import Link from "next/link";
import { PenLine } from "lucide-react";
import { greeting } from "@/domains/decision/labels";
import { useReviewQueue } from "@/domains/decision/queries";
import RecallChips from "./_components/RecallChips";
import ReviewQueueCard from "./_components/ReviewQueueCard";

export default function HomePage() {
  const { data: queue = [] } = useReviewQueue();

  return (
    <main className="space-y-6 px-5 pt-12">
      <header className="animate-rise rounded-3xl bg-hero px-6 py-7">
        <p className="font-display text-lg font-semibold text-hero-ink">krine</p>
        <p className="mt-5 text-sm text-hero-ink-soft">{greeting()}</p>
        <h1 className="font-display mt-1.5 text-[22px] font-semibold leading-snug text-hero-ink">
          오늘 어떤 선택을
          <br />
          했나요?
        </h1>
      </header>

      <ReviewQueueCard items={queue} />

      <section className="space-y-3">
        <RecallChips />
        <Link
          href="/write"
          className="flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-center font-semibold text-white"
        >
          <PenLine size={17} aria-hidden /> 판단 기록하기
        </Link>
      </section>

    </main>
  );
}
