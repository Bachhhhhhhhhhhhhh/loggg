"use client";

import Link from "next/link";
import { INCOTERM_MATRIX } from "@/data/incoterms";
import { cn } from "@/lib/utils";

export function IncotermsMatrix() {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800/60">
      <table className="w-full text-xs min-w-[900px]">
        <thead>
          <tr className="bg-slate-900/80 border-b border-slate-800">
            <th className="px-3 py-2.5 text-left text-slate-500 font-semibold sticky left-0 bg-slate-900/95 z-10">
              Nghĩa vụ
            </th>
            {INCOTERM_MATRIX.headers.map((code) => (
              <th key={code} className="px-2 py-2.5 text-center">
                <Link
                  href={`/incoterms/${code.toLowerCase()}/`}
                  className="font-mono font-bold text-blue-400 hover:underline"
                >
                  {code}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {INCOTERM_MATRIX.rows.map((row, i) => (
            <tr
              key={row.label}
              className={cn(
                "border-b border-slate-800/40",
                i % 2 === 0 ? "bg-transparent" : "bg-slate-900/20"
              )}
            >
              <td className="px-3 py-2 text-slate-400 font-medium sticky left-0 bg-slate-950/90 z-10">
                {row.label}
              </td>
              {row.values.map((val, j) => (
                <td key={j} className="px-2 py-2 text-center text-slate-300 font-mono text-[10px]">
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}