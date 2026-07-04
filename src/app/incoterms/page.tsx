import type { CSSProperties } from "react";
import Link from "next/link";
import { Globe, BookOpen, Wrench, Layers } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { IncotermCard } from "@/components/incoterms/IncotermCard";
import { IncotermsMatrix } from "@/components/incoterms/IncotermsMatrix";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { incoterms, INCOTERM_GROUPS, type IncotermGroup } from "@/data/incoterms";

const GROUP_ORDER: IncotermGroup[] = ["E", "F", "C", "D"];

export default function IncotermsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <PageHeader
        title="Incoterms® 2020"
        subtitle="ICC — 11 ĐIỀU KHOẢN · 4 NHÓM E/F/C/D · ĐẦY ĐỦ NHẤT"
        badge="11 TERMS"
        badgeVariant="teal"
        icon={<Globe className="h-5 w-5" />}
      />

      <Card className="glow-teal">
        <CardContent className="p-5">
          <p className="text-sm text-slate-300 leading-relaxed">
            <strong className="text-slate-100">Incoterms® 2020</strong> quy định nghĩa vụ giao hàng,
            điểm chuyển <strong className="text-amber-400">rủi ro</strong> và phân bổ{" "}
            <strong className="text-teal-400">chi phí</strong> trong thương mại quốc tế.
            LogIQ tích hợp đầy đủ 11 điều khoản với ma trận so sánh, bài học và công cụ tư vấn.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button asChild size="sm">
              <Link href="/tools/?tool=incoterms">
                <Wrench className="h-3.5 w-3.5" />
                Công cụ tư vấn
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/learn/incoterms-trade/incoterms-intro/">
                <BookOpen className="h-3.5 w-3.5" />
                8 bài học
              </Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/resources/incoterms-2020/">
                <Layers className="h-3.5 w-3.5" />
                Tri thức khoa học
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {GROUP_ORDER.map((g) => {
          const meta = INCOTERM_GROUPS[g];
          const count = incoterms.filter((t) => t.group === g).length;
          return (
            <Card key={g} className="card-accent" style={{ "--accent-color": meta.color } as CSSProperties}>
              <CardContent className="p-4">
                <p className="text-2xl font-bold font-mono" style={{ color: meta.color }}>{g}</p>
                <p className="text-xs font-semibold text-slate-200 mt-1">{meta.label}</p>
                <p className="text-[10px] text-slate-500 mt-1">{count} điều khoản</p>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">{meta.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {GROUP_ORDER.map((g) => {
        const terms = incoterms.filter((t) => t.group === g);
        const meta = INCOTERM_GROUPS[g];
        return (
          <div key={g}>
            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <span
                className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white"
                style={{ backgroundColor: meta.color }}
              >
                {g}
              </span>
              {meta.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {terms.map((term) => (
                <IncotermCard key={term.code} term={term} />
              ))}
            </div>
          </div>
        );
      })}

      <Card>
        <CardHeader>
          <CardTitle className="normal-case">Ma trận nghĩa vụ — 11 điều khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <IncotermsMatrix />
        </CardContent>
      </Card>
    </div>
  );
}