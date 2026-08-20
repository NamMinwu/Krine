"use client";

import { useState } from "react";

export default function EditSheet({
  title,
  value,
  hint,
  onSave,
  onClose,
}: {
  title: string;
  value: string;
  hint?: string;
  onSave: (value: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <div className="fixed inset-0 z-20 flex items-end bg-black/30" onClick={onClose}>
      <div
        className="w-full rounded-t-2xl bg-surface p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-semibold">{title}</p>
        {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="mt-3 min-h-28 w-full resize-none rounded-xl border border-line p-3 text-[15px] outline-none focus:border-accent"
          autoFocus
        />
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-line py-2.5 text-ink-soft"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="flex-1 rounded-xl bg-accent py-2.5 font-semibold text-white"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
