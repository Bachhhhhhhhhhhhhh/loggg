import Link from "next/link";
import { ArrowLeft, AlertTriangle, FileText, Shield, Truck } from "lucide-react";
import type { Incoterm } from "@/data/incoterms";
import { INCOTERM_GROUPS } from "@/data/incoterms";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function IncotermDetailView({ term }: { term: Incoterm }) {
  const group = INCOTERM_GROUPS[term.group];

  return (
    <div className="space-y-6">
      <Link
        href="/incoterms/"
        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-blue-400 transition-colors"
      >
        <ArrowLeft className="h-3 w-3" />
        Quay lại Incoterms 2020
      </Link>

      <div className="flex flex-wrap items-start gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold text-white font-mono shadow-lg"
          style={{ backgroundColor: group.color }}
        >
          {term.code}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge style={{ borderColor: group.color }}>{term.groupLabel}</Badge>
            <Badge variant="secondary">{term.transportNote}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-50">{term.fullName}</h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">{term.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Truck, label: "Giao hàng", value: term.sellerDelivers, color: "text-blue-400" },
          { icon: AlertTriangle, label: "Chuyển rủi ro", value: term.riskTransfer, color: "text-amber-400" },
          { icon: FileText, label: "Chuyển chi phí", value: term.costTransfer, color: "text-teal-400" },
          { icon: Shield, label: "Bảo hiểm", value: term.insurance, color: "text-emerald-400" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4">
              <item.icon className={`h-4 w-4 ${item.color} mb-2`} />
              <p className="text-[10px] text-slate-500 uppercase">{item.label}</p>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="normal-case text-sm">Hải quan & Vận chuyển</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-300">
            <p><strong className="text-slate-200">Xuất khẩu:</strong> {term.exportClearance}</p>
            <p><strong className="text-slate-200">Nhập khẩu:</strong> {term.importClearance}</p>
            <p><strong className="text-slate-200">Xếp hàng xuất:</strong> {term.loadingAtOrigin}</p>
            <p><strong className="text-slate-200">Dỡ hàng đích:</strong> {term.unloadingAtDestination}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="normal-case text-sm">Khi nào dùng</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {term.whenToUse.map((w) => (
                <li key={w} className="text-xs text-slate-300 flex gap-2">
                  <span className="text-blue-400">▸</span>{w}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="normal-case text-sm text-emerald-400">Ưu điểm Người bán</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1">{term.sellerPros.map((p) => (
              <li key={p} className="text-xs text-slate-300">✓ {p}</li>
            ))}</ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="normal-case text-sm text-red-400">Nhược điểm Người bán</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1">{term.sellerCons.map((p) => (
              <li key={p} className="text-xs text-slate-300">✗ {p}</li>
            ))}</ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="normal-case text-sm text-emerald-400">Ưu điểm Người mua</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1">{term.buyerPros.map((p) => (
              <li key={p} className="text-xs text-slate-300">✓ {p}</li>
            ))}</ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="normal-case text-sm text-red-400">Nhược điểm Người mua</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1">{term.buyerCons.map((p) => (
              <li key={p} className="text-xs text-slate-300">✗ {p}</li>
            ))}</ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="normal-case">Bảng nghĩa vụ A/B tóm tắt</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="text-left py-2 px-2">Nhiệm vụ</th>
                <th className="text-center py-2 px-2">Seller</th>
                <th className="text-center py-2 px-2">Buyer</th>
              </tr>
            </thead>
            <tbody>
              {term.obligations.map((o) => (
                <tr key={o.task} className="border-b border-slate-800/40">
                  <td className="py-2 px-2 text-slate-300">{o.task}</td>
                  <td className="py-2 px-2 text-center font-mono text-blue-400">{o.seller}</td>
                  <td className="py-2 px-2 text-center font-mono text-teal-400">{o.buyer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="normal-case text-sm">Chứng từ điển hình</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {term.documents.map((d) => (
              <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>
            ))}
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader><CardTitle className="normal-case text-sm text-amber-400">Sai lầm thường gặp</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {term.commonMistakes.map((m) => (
                <li key={m} className="text-xs text-slate-300 flex gap-2">
                  <span className="text-amber-400">!</span>{m}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-500">Liên quan:</span>
        {term.relatedTerms.map((r) => (
          <Link key={r} href={`/incoterms/${r.toLowerCase()}/`}>
            <Badge variant="default" className="cursor-pointer hover:bg-blue-500/20">{r}</Badge>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/tools/?tool=incoterms">Dùng công cụ tư vấn</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/learn/incoterms-trade/incoterms-intro/">Học module Incoterms</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/resources/incoterms-2020/">Tri thức khoa học</Link>
        </Button>
      </div>
    </div>
  );
}