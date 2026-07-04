"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { incoterms, recommendIncoterms, INCOTERM_GROUPS } from "@/data/incoterms";
import { IncotermsMatrix } from "@/components/incoterms/IncotermsMatrix";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function IncotermsAdvisor() {
  const [transport, setTransport] = useState<"all" | "sea">("sea");
  const [sellerControl, setSellerControl] = useState<"minimal" | "moderate" | "maximum">("moderate");
  const [insuranceNeeded, setInsuranceNeeded] = useState(true);
  const [importBySeller, setImportBySeller] = useState(false);
  const [filterGroup, setFilterGroup] = useState<string>("all");

  const recommendation = useMemo(
    () => recommendIncoterms({ transport, sellerControl, insuranceNeeded, importBySeller }),
    [transport, sellerControl, insuranceNeeded, importBySeller]
  );

  const filtered = useMemo(() => {
    if (filterGroup === "all") return incoterms;
    return incoterms.filter((t) => t.group === filterGroup);
  }, [filterGroup]);

  return (
    <div className="space-y-6">
      <Card className="glow-blue">
        <CardHeader>
          <CardTitle className="normal-case">Tư vấn chọn Incoterm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-2">Phương thức vận tải</p>
              <div className="flex gap-2">
                {(["sea", "all"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTransport(t)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs border transition-all",
                      transport === t
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                        : "border-slate-800 text-slate-500"
                    )}
                  >
                    {t === "sea" ? "Đường biển" : "Đa phương thức"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2">Mức dịch vụ Seller</p>
              <div className="flex flex-wrap gap-2">
                {([
                  ["minimal", "Tối thiểu"],
                  ["moderate", "Cân bằng"],
                  ["maximum", "Tối đa"],
                ] as const).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setSellerControl(v)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs border transition-all",
                      sellerControl === v
                        ? "border-teal-500/40 bg-teal-500/10 text-teal-400"
                        : "border-slate-800 text-slate-500"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={insuranceNeeded}
                onChange={(e) => setInsuranceNeeded(e.target.checked)}
                className="rounded border-slate-600"
              />
              Seller cần mua bảo hiểm
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={importBySeller}
                onChange={(e) => setImportBySeller(e.target.checked)}
                className="rounded border-slate-600"
              />
              Seller lo thủ tục nhập khẩu
            </label>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-blue-500/20">
            <p className="text-[10px] text-slate-500 uppercase mb-2">Gợi ý chính</p>
            <Link href={`/incoterms/${recommendation.primary.code.toLowerCase()}/`}>
              <span className="text-2xl font-bold font-mono text-blue-400 hover:underline">
                {recommendation.primary.code}
              </span>
            </Link>
            <p className="text-sm text-slate-300 mt-1">{recommendation.primary.fullName}</p>
            <p className="text-xs text-slate-400 mt-2">{recommendation.reasoning}</p>
            {recommendation.alternatives.length > 0 && (
              <div className="flex gap-2 mt-3">
                <span className="text-[10px] text-slate-500">Thay thế:</span>
                {recommendation.alternatives.map((a) => (
                  <Link key={a.code} href={`/incoterms/${a.code.toLowerCase()}/`}>
                    <Badge variant="secondary" className="cursor-pointer">{a.code}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {["all", "E", "F", "C", "D"].map((g) => (
          <button
            key={g}
            onClick={() => setFilterGroup(g)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs border",
              filterGroup === g
                ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                : "border-slate-800 text-slate-500"
            )}
          >
            {g === "all" ? "Tất cả 11" : `Nhóm ${g}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((term) => {
          const g = INCOTERM_GROUPS[term.group];
          const isPrimary = term.code === recommendation.primary.code;
          return (
            <Link key={term.code} href={`/incoterms/${term.code.toLowerCase()}/`}>
              <Card className={cn("h-full hover:border-slate-600 transition-all", isPrimary && "border-blue-500/40 glow-blue")}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono font-bold text-lg"
                      style={{ color: g.color }}
                    >
                      {term.code}
                    </span>
                    {isPrimary && <Badge variant="success" className="text-[9px]">Đề xuất</Badge>}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{term.summary}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle className="normal-case">Ma trận so sánh đầy đủ</CardTitle></CardHeader>
        <CardContent>
          <IncotermsMatrix />
        </CardContent>
      </Card>
    </div>
  );
}