"use client";

import { useState } from "react";
import { BookOpen, Database } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KnowledgeArticle } from "@/components/resources/KnowledgeArticle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { knowledgeBase } from "@/data/knowledge-base";
import { curatedResources } from "@/data/resources";
import { cn } from "@/lib/utils";

const categories = ["Tất cả", ...Array.from(new Set(knowledgeBase.map((k) => k.category)))];

const typeVariant: Record<string, "default" | "teal" | "success" | "warning" | "secondary"> = {
  article: "default",
  book: "teal",
  course: "success",
  tool: "warning",
  dataset: "secondary",
};

export default function ResourcesPage() {
  const [filter, setFilter] = useState("Tất cả");

  const filtered =
    filter === "Tất cả"
      ? knowledgeBase
      : knowledgeBase.filter((k) => k.category === filter);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <PageHeader
        title="Thư viện tri thức"
        subtitle="KIẾN THỨC TÍCH HỢP · PHÂN TÍCH KHOA HỌC · SUPPLY CHAIN"
        badge={`${knowledgeBase.length} CHỦ ĐỀ`}
        icon={<Database className="h-5 w-5" />}
      />

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-slate-400 leading-relaxed">
            Toàn bộ kiến thức từ các nguồn open-source và framework chuẩn ngành đã được
            <strong className="text-slate-200"> tích hợp trực tiếp</strong> vào LogIQ — bao gồm
            lý thuyết, công thức, phương pháp, code Python và liên kết module học tập.
            Không cần tra cứu bên ngoài.
          </p>
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
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((entry) => (
          <KnowledgeArticle key={entry.id} entry={entry} compact />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="normal-case flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-400" />
            Tài liệu tham khảo bổ sung (mô tả)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500 mb-3">
            Danh mục tham khảo — nội dung chính đã tích hợp trong Thư viện tri thức phía trên.
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