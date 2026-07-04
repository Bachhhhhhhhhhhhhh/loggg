"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { BookOpen, FlaskConical, Layers, Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/learn/CodeBlock";
import type { KnowledgeEntry } from "@/data/knowledge-base";
import { modules } from "@/data/modules";

const categoryColor: Record<string, string> = {
  "Phân tích": "#3B82F6",
  "Tối ưu hóa": "#14B8A6",
  "Tồn kho": "#8B5CF6",
  "Kho bãi": "#F59E0B",
  "Vận tải": "#EF4444",
  "Machine Learning": "#22C55E",
  "Thư viện": "#6B7280",
};

interface KnowledgeArticleProps {
  entry: KnowledgeEntry;
  compact?: boolean;
}

export function KnowledgeArticle({ entry, compact = false }: KnowledgeArticleProps) {
  const relatedModules = modules.filter((m) => entry.relatedModuleIds.includes(m.id));

  if (compact) {
    return (
      <Link href={`/resources/${entry.id}`}>
        <Card className="card-accent hover:border-slate-600 transition-all h-full group"
          style={{ "--accent-color": categoryColor[entry.category] || "#3B82F6" } as CSSProperties}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-[9px]">{entry.category}</Badge>
              <Badge variant="default" className="text-[9px]">{entry.language}</Badge>
            </div>
            <h3 className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
              {entry.title}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">{entry.subtitle}</p>
            <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">{entry.summary}</p>
            <div className="flex flex-wrap gap-1 mt-3">
              {entry.keyConcepts.slice(0, 3).map((c) => (
                <Badge key={c} variant="teal" className="text-[9px]">{c.split("(")[0].trim()}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge style={{ borderColor: categoryColor[entry.category] }}>{entry.category}</Badge>
          <Badge variant="secondary">{entry.language}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-slate-50">{entry.title}</h1>
        <p className="text-sm text-teal-400 mt-1">{entry.subtitle}</p>
        <p className="text-sm text-slate-400 mt-3 leading-relaxed">{entry.summary}</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="normal-case">Tổng quan khoa học</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>{entry.overview}</p>
          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
            <p className="text-xs text-blue-400 font-semibold uppercase mb-1">Cơ sở khoa học</p>
            <p className="text-xs text-slate-400">{entry.scientificBasis}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="normal-case">Khái niệm cốt lõi</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {entry.keyConcepts.map((c) => (
                <li key={c} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">▸</span>{c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="normal-case">Ứng dụng thực tiễn</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {entry.applications.map((a) => (
                <li key={a} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>{a}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {entry.formulas && entry.formulas.length > 0 && (
        <Card className="glow-blue">
          <CardHeader>
            <CardTitle className="normal-case flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-400" />
              Công thức & Mô hình
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entry.formulas.map((f) => (
              <div key={f.name} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <p className="text-xs font-semibold text-slate-200">{f.name}</p>
                <p className="text-lg font-mono text-blue-400 mt-1">{f.expression}</p>
                <p className="text-[10px] text-slate-500 mt-1">{f.variables}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="normal-case">Phương pháp triển khai</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {entry.methods.map((m) => (
              <Badge key={m} variant="secondary" className="text-[10px]">{m}</Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {entry.pythonStack.map((lib) => (
              <Badge key={lib} variant="teal" className="text-[10px] font-mono">{lib}</Badge>
            ))}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
            <strong className="text-slate-300">Lưu ý:</strong> {entry.implementationNotes}
          </p>
        </CardContent>
      </Card>

      {entry.codeExample && <CodeBlock code={entry.codeExample} />}

      <Card>
        <CardHeader>
          <CardTitle className="normal-case flex items-center gap-2">
            <Layers className="h-4 w-4 text-teal-400" />
            Liên kết trong LogIQ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {relatedModules.length > 0 && (
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-2">Module học tập</p>
              <div className="flex flex-wrap gap-2">
                {relatedModules.map((m) => (
                  <Link key={m.id} href={`/learn/${m.id}/${m.lessons[0].id}`}>
                    <Badge variant="default" className="cursor-pointer hover:bg-blue-500/20">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {m.title}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {entry.relatedToolIds && entry.relatedToolIds.length > 0 && (
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-2">Công cụ tương tác</p>
              <div className="flex flex-wrap gap-2">
                {entry.relatedToolIds.map((toolId) => (
                  <Link key={toolId} href={`/tools?tool=${toolId}`}>
                    <Badge variant="success" className="cursor-pointer hover:bg-emerald-500/20">
                      <FlaskConical className="h-3 w-3 mr-1" />
                      {toolId.toUpperCase()}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}