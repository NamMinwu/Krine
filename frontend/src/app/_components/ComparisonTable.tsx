"use client";

import { Pencil } from "lucide-react";
import type { OptionInput } from "@/domains/decision/types";

const ROWS = [
  { key: "gains", label: "얻는 것" },
  { key: "sacrifices", label: "포기하는 것" },
  { key: "premises", label: "핵심 전제" },
] as const;

export type OptionField = (typeof ROWS)[number]["key"];

export default function ComparisonTable({
  options,
  onEditCell,
  onEditLabel,
}: {
  options: OptionInput[];
  onEditCell?: (optionIndex: number, field: OptionField) => void;
  onEditLabel?: (optionIndex: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-20" />
            {options.map((option, index) => (
              <th
                key={`${option.label}-${index}`}
                className="rounded-t-lg bg-accent-soft px-2 py-2 text-center font-semibold text-accent"
                onClick={() => onEditLabel?.(index)}
              >
                {option.label}
                {onEditLabel && (
                  <Pencil size={10} className="ml-1 inline opacity-60" aria-hidden />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.key} className="border-b border-line">
              <td className="py-2 pr-2 align-top text-xs font-medium text-ink-soft">
                {row.label}
              </td>
              {options.map((option, index) => (
                <td
                  key={`${option.label}-${row.key}`}
                  className="px-2 py-2 align-top"
                  onClick={() => onEditCell?.(index, row.key)}
                >
                  <ul className="space-y-1">
                    {option[row.key].map((item) => (
                      <li key={item}>· {item}</li>
                    ))}
                    {option[row.key].length === 0 && (
                      <li className="text-ink-soft">—</li>
                    )}
                  </ul>
                  {onEditCell && (
                    <span className="mt-1 block text-xs text-ink-soft">
                      <Pencil size={11} aria-hidden />
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
