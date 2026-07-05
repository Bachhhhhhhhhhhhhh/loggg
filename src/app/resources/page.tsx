"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Database,
  Search,
  BookMarked,
  Calculator,
  Lightbulb,
  Layers,
  HelpCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KnowledgeArticle } from "@/components/resources/KnowledgeArticle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  knowledgeBase,
  knowledgeStats,
  searchKnowledge,
} from "@/data/knowledge";
import { curatedResources } from "@/data/resources";
import { cn } from "@/lib/utils";

const categories = ["Tất cả", ...Array.from(new Set(knowledgeBase.map((k) => k.category)))];

const categoryDesc: Record<string, string> = {
  "Phân tích": "ABC, KPI, SCOR, phân tích định lượng",
  "Tối ưu hóa": "LP, MILP, network design, OR-Tools",
  "Tồn kho": "EOQ, safety stock, inventory theory",
  "Kho bãi": "WMS, picking, slotting, cycle count",
  "Vận tải": "TMS, VRP, last-mile, fleet",
  "Thương mại QT": "Incoterms 2020, landed cost, L/C",
  "Machine Learning": "Forecast, Prophet, demand planning",
  "Thư viện": "SciPy, OR-Tools, Python stack",
  "Chiến lược": "SCOR, S&OP, Lean, risk, bullwhip",
  "Mua hàng": "Sourcing, OTIF, TCO, supplier scorecard",
  "Bền vững": "ESG, carbon footprint, green logistics",
};

const typeVariant: Record<string, "default" | "teal" | "success" | "warning" | "secondary"> = {
  article: "default",
  book: "teal",
  course: "success",
  tool: "warning",
  dataset: "secondary",
};

export default function ResourcesPage() {
  const [filter, setFilter] = useState("Tất cả");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = filter === "Tất cả" ? knowledgeBase : knowledgeBase.filter((k) => k.category === filter);
    if (query.trim()) {
      const searched = new Set(searchKnowledge(query).map((k) => k.id));
      list = list.filter((k) => searched.has(k.id));
    }
    return list;
  }, [filter, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <PageHeader
        title="Thư viện tri thức"
        subtitle="KIẾN THỨC CHUYÊN SÂU · LÝ THUYẾT + THỰC HÀNH · SUPPLY CHAIN & LOGISTICS"
        badge={`${knowledgeStats.topics} CHỦ ĐỀ`}
        icon={<Database className="h-5 w-5" />}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon: BookMarked, label: "Chủ đề", value: knowledgeStats.topics, color: "text-blue-400" },
          { icon: Lightbulb, label: "Khái niệm", value: knowledgeStats.concepts, color: "text-teal-400" },
          { icon: Layers, label: "Chuyên sâu", value: knowledgeStats.sections, color: "text-purple-400" },
          { icon: Calculator, label: "Công thức", value: knowledgeStats.formulas, color: "text-indigo-400" },
          { icon: HelpCircle, label: "FAQ", value: knowledgeStats.faq, color: "text-pink-400" },
          { icon: BookOpen, label: "Case study", value: knowledgeStats.caseStudies, color: "text-amber-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-slate-900/40">
            <CardContent className="p-3 flex items-center gap-3">
              <s.icon className={cn("h-5 w-5", s.color)} />
              <div>
                <p className={cn("text-lg font-bold font-mono", s.color)}>{s.value}</p>
                <p className="text-[10px] text-slate-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm text-slate-300 leading-relaxed">
            Thư viện tri thức LogIQ — <strong className="text-slate-100">không phải link ngoài</strong>,
            mà là bài viết chuyên sâu tích hợp sẵn: lý thuyết khoa học, công thức, quy trình từng bước,
            case study VN, FAQ, KPI benchmark, code Python, và liên kết module học tập.
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm chủ đề, khái niệm, thuật ngữ…"
              className="pl-9 bg-slate-900/60 border-slate-800"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              filter === cat
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                : "bg-slate-900/50 text-slate-500 border border-slate-800 hover:border-slate-700"
            )}
            title={cat !== "Tất cả" ? categoryDesc[cat] : undefined}
          >
            {cat}
            {cat !== "Tất cả" && (
              <span className="ml-1 text-slate-600">
                ({knowledgeBase.filter((k) => k.category === cat).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filter !== "Tất cả" && categoryDesc[filter] && (
        <p className="text-xs text-slate-500 -mt-2">{categoryDesc[filter]}</p>
      )}

      <p className="text-xs text-slate-600">
        Hiển thị {filtered.length}/{knowledgeBase.length} chủ đề
        {query && ` · tìm "${query}"`}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((entry) => (
          <KnowledgeArticle key={entry.id} entry={entry} compact />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          Không tìm thấy chủ đề — thử từ khóa khác hoặc chọn &quot;Tất cả&quot;
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="normal-case flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-400" />
            Tài liệu tham khảo bổ sung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500 mb-3">
            Nguồn học thêm — nội dung chính đã được tích hợp trong thư viện phía trên.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {curatedResources.map((resource) => (
              <div
                key={resource.id}
                className="p-4 rounded-lg border border-slate-800 bg-slate-900/30"
              >
                <Badge variant={typeVariant[resource.type] || "secondary"} className="text-[10px]">
                  {resource.type}
                </Badge>
                <h3 className="text-sm font-semibold text-slate-200 mt-2">{resource.title}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{resource.category}</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{resource.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}