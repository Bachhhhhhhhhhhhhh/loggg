import type { CSSProperties } from "react";
import Link from "next/link";
import type { Incoterm } from "@/data/incoterms";
import { INCOTERM_GROUPS } from "@/data/incoterms";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function IncotermCard({ term }: { term: Incoterm }) {
  const group = INCOTERM_GROUPS[term.group];

  return (
    <Link href={`/incoterms/${term.code.toLowerCase()}/`}>
      <Card
        className="card-accent hover:border-slate-600 transition-all h-full group"
        style={{ "--accent-color": group.color } as CSSProperties}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors font-mono">
              {term.code}
            </span>
            <Badge variant="secondary" className="text-[9px]">
              Nhóm {term.group}
            </Badge>
          </div>
          <p className="text-xs text-teal-400 font-medium">{term.fullName}</p>
          <p className="text-[10px] text-slate-500 mt-1">{term.transportNote}</p>
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{term.summary}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            <Badge variant="default" className="text-[9px]">Risk: {term.riskTransfer.split("—")[0].trim().slice(0, 20)}</Badge>
            {term.transportScope === "sea-inland" && (
              <Badge variant="warning" className="text-[9px]">Sea only</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}