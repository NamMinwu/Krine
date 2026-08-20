"use client";

import { relativeTime, VERDICT_LABELS } from "@/domains/decision/labels";
import type { DecisionVersion } from "@/domains/decision/types";

export default function VersionTimeline({ versions }: { versions: DecisionVersion[] }) {
  return (
    <ol className="space-y-0">
      {versions.map((version, index) => {
        const meta = VERDICT_LABELS[version.verdict];
        const isLast = index === versions.length - 1;
        return (
          <li key={version.id} className="relative pl-6 pb-4 last:pb-0">
            {!isLast && (
              <span className="absolute left-[7px] top-5 h-full w-px bg-line" aria-hidden />
            )}
            <span
              className={`absolute left-0 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${meta.className}`}
              aria-hidden
            >
              {meta.icon}
            </span>
            <div>
              <p className="text-xs text-ink-soft">
                v{version.versionNo} · {meta.label} · {relativeTime(version.createdAt)}
              </p>
              <p className={`mt-0.5 text-sm ${isLast ? "font-semibold" : ""}`}>
                {version.conclusion}
              </p>
              {version.reason && (
                <p className="mt-1 text-xs text-ink-soft">이유: {version.reason}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
