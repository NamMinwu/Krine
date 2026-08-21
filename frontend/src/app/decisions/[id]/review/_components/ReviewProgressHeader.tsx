"use client";

export default function ReviewProgressHeader({
  index,
  total,
  onBack,
}: {
  index: number;
  total: number;
  onBack: () => void;
}) {
  return (
    <>
      <div className="flex w-full items-center justify-between">
        <button type="button" onClick={onBack} className="text-ink-soft" aria-label="뒤로">
          ←
        </button>
        {index >= 0 && (
          <span className="text-xs text-ink-soft">
            재검토 {index + 1} / {total}
          </span>
        )}
      </div>
      {index >= 0 && total > 1 && (
        <div className="mt-3 h-1 w-full rounded-full bg-line">
          <div
            className="h-1 rounded-full bg-warn transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      )}
    </>
  );
}
