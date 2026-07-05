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
  FlaskConical,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { StatPill } from "@/components/ui/StatPill";
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

const statItems = [
  { icon: BookMarked, label: "Chủ đề", value: knowledgeStats.topics, color: "text-blue-400", accent: "#3b82f6" },
  { icon: Lightbulb, label: "Khái niệm", value: knowledgeStats.concepts, color: "text-teal-400", accent: "#14b8a6" },
  { icon: Layers, label: "Chuyên sâu", value: knowledgeStats.sections, color: "text-purple-400", accent: "#8b5cf6" },
  { icon: FlaskConical, label: "Mô phỏng", value: knowledgeStats.simulations, color: "text-emerald-400", accent: "#10b981" },
  { icon: Calculator, label: "Công thức", value: knowledgeStats.formulas, color: "text-indigo-400", accent: "#6366f1" },
  { icon: HelpCircle, label: "FAQ", value: knowledgeStats.faq, color: "text-pink-400", accent: "#ec4899" },
  { icon: BookOpen, label: "Case study", value: knowledgeStats.caseStudies, color: "text-amber-400", accent: "#f59e0b" },
];

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
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-8">
      <PageHeader
        variant="hero"
        eyebrow="Knowledge Base"
        title="Thư viện tri thức"
        subtitle="KIẾN THỨC CHUYÊN SÂU · LÝ THUYẾT + THỰC HÀNH · SUPPLY CHAIN & LOGISTICS"
        badge={`${knowledgeStats.topics} CHỦ ĐỀ`}
        icon={<Database className="h-5 w-5" />}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {statItems.map((s) => (
          <StatPill key={s.label} {...s} />
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            Thư viện tri thức LogIQ — <strong className="text-slate-100">không phải link ngoài</strong>,
            mà là bài viết chuyên sâu tích hợp sẵn: lý thuyết khoa học, công thức, quy trình từng bước,
            case study VN, FAQ, KPI benchmark, code Python, mô phỏng tương tác và liên kết module học tập.
          </p>
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm chủ đề, khái niệm, thuật ngữ…"
              className="pl-9 h-10"
            />
          </div>
        </CardContent>
      </Card>

      <div>
        <SectionHeader
          eyebrow="Lọc theo danh mục"
          title="Chủ đề"
          className="mb-3"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "pro-filter-pill",
                filter === cat && "pro-filter-pill-active"
              )}
              title={cat !== "Tất cả" ? categoryDesc[cat] : undefined}
            >
              {cat}
              {cat !== "Tất cả" && (
                <span className="ml-1 opacity-60">
                  ({knowledgeBase.filter((k) => k.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {filter !== "Tất cả" && categoryDesc[filter] && (
        <p className="text-xs text-slate-500 -mt-4">{categoryDesc[filter]}</p>
      )}

      <p className="text-xs text-slate-600 font-mono">
        Hiển thị {filtered.length}/{knowledgeBase.length} chủ đề
        {query && ` · tìm "${query}"`}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((entry) => (
          <KnowledgeArticle key={entry.id} entry={entry} compact />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 pro-surface rounded-2xl">
          <p className="text-slate-400 text-sm">Không tìm thấy chủ đề</p>
          <p className="text-xs text-slate-600 mt-1">Thử từ khóa khác hoặc chọn &quot;Tất cả&quot;</p>
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
          <p className="text-xs text-slate-500 mb-4">
            Nguồn học thêm — nội dung chính đã được tích hợp trong thư viện phía trên.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {curatedResources.map((resource) => (
              <div
                key={resource.id}
                className="pro-surface pro-surface-hover p-4 rounded-xl"
              >
                <Badge variant={typeVariant[resource.type] || "secondary"} className="text-[10px]">
                  {resource.type}
                </Badge>
                <h3 className="text-sm font-semibold text-slate-200 mt-2">{resource.title}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{resource.category}</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{resource.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}