"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import {
  BookOpen,
  FlaskConical,
  Calculator,
  AlertTriangle,
  ListOrdered,
  HelpCircle,
  MapPin,
  Clock,
  BarChart3,
  Layers,
} from "lucide-react";
import { KnowledgeSimulator } from "./KnowledgeSimulator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/learn/CodeBlock";
import type { KnowledgeEntry } from "@/data/knowledge";
import { modules } from "@/data/modules";

const categoryColor: Record<string, string> = {
  "Phân tích": "#3B82F6",
  "Tối ưu hóa": "#14B8A6",
  "Tồn kho": "#8B5CF6",
  "Kho bãi": "#F59E0B",
  "Vận tải": "#EF4444",
  "Thương mại QT": "#0EA5E9",
  "Machine Learning": "#22C55E",
  "Thư viện": "#6B7280",
  "Chiến lược": "#EC4899",
  "Mua hàng": "#F97316",
  "Bền vững": "#10B981",
};

const difficultyVariant: Record<string, "default" | "teal" | "warning"> = {
  "Cơ bản": "teal",
  "Trung cấp": "default",
  "Nâng cao": "warning",
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
        <Card
          className="card-accent pro-surface-hover transition-all h-full group"
          style={
            { "--accent-color": categoryColor[entry.category] || "#3B82F6" } as CSSProperties
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <Badge variant="secondary" className="text-[9px]">
                {entry.category}
              </Badge>
              <Badge variant={difficultyVariant[entry.difficulty] ?? "default"} className="text-[9px]">
                {entry.difficulty}
              </Badge>
              <span className="text-[9px] text-slate-600 flex items-center gap-0.5 ml-auto">
                <Clock className="h-2.5 w-2.5" />
                {entry.readingTime}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
              {entry.title}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">{entry.subtitle}</p>
            <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
              {entry.summary}
            </p>
            {entry.simulationModels && entry.simulationModels.length > 0 && (
              <Badge variant="teal" className="text-[9px] mt-2 gap-0.5">
                <FlaskConical className="h-2.5 w-2.5" />
                {entry.simulationModels.length} mô phỏng
              </Badge>
            )}
            <div className="flex flex-wrap gap-1 mt-3">
              {entry.keyConcepts.slice(0, 2).map((c) => (
                <Badge key={c} variant="teal" className="text-[9px]">
                  {c.split("(")[0].trim().slice(0, 28)}
                </Badge>
              ))}
              {entry.keyConcepts.length > 2 && (
                <Badge variant="secondary" className="text-[9px]">
                  +{entry.keyConcepts.length - 2}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  const toc = [
    { id: "overview", label: "Tổng quan" },
    entry.whenToUse && { id: "when", label: "Khi nào dùng" },
    { id: "concepts", label: "Khái niệm" },
    ...(entry.sections?.map((s) => ({ id: s.id, label: s.title })) ?? []),
    entry.stepByStep.length > 0 && { id: "steps", label: "Quy trình" },
    entry.simulationModels?.length && { id: "simulations", label: "Mô phỏng" },
    entry.formulas?.length && { id: "formulas", label: "Công thức" },
    entry.metrics?.length && { id: "metrics", label: "KPI" },
    entry.caseStudies?.length && { id: "cases", label: "Case study" },
    entry.faq?.length && { id: "faq", label: "FAQ" },
    entry.glossary?.length && { id: "glossary", label: "Thuật ngữ" },
    entry.pitfalls.length > 0 && { id: "pitfalls", label: "Lưu ý" },
    { id: "implement", label: "Triển khai" },
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <nav className="hidden lg:block w-52 shrink-0">
        <div className="sticky top-28 pro-surface rounded-xl p-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-semibold mb-3">
            Mục lục
          </p>
          <div className="pro-article-toc space-y-0.5">
            {toc.map((item) => (
              <a key={item.id} href={`#${item.id}`}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <div className="flex-1 min-w-0 space-y-6">
        <div id="overview" className="pro-page-header pb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge style={{ borderColor: categoryColor[entry.category] }}>{entry.category}</Badge>
            <Badge variant={difficultyVariant[entry.difficulty] ?? "default"}>
              {entry.difficulty}
            </Badge>
            <Badge variant="secondary">{entry.language}</Badge>
              <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {entry.readingTime}
            </Badge>
            {entry.simulationModels && entry.simulationModels.length > 0 && (
              <Badge variant="teal" className="gap-1">
                <FlaskConical className="h-3 w-3" />
                {entry.simulationModels.length} mô phỏng
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 tracking-tight text-balance">
            {entry.title}
          </h1>
          <p className="text-sm text-teal-400/90 mt-2 font-mono tracking-wide">{entry.subtitle}</p>
          <p className="text-sm text-slate-400 mt-3 leading-relaxed">{entry.summary}</p>
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {entry.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-[9px] font-mono">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="normal-case">Tổng quan khoa học</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>{entry.overview}</p>
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
              <p className="text-xs text-blue-400 font-semibold uppercase mb-1">Cơ sở khoa học</p>
              <p className="text-xs text-slate-400">{entry.scientificBasis}</p>
            </div>
          </CardContent>
        </Card>

        <div id="when" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-emerald-500/20">
            <CardHeader>
              <CardTitle className="normal-case text-emerald-400 text-sm">Khi nào nên dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-300 leading-relaxed">{entry.whenToUse}</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20">
            <CardHeader>
              <CardTitle className="normal-case text-amber-400 text-sm">Khi nào không nên dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-300 leading-relaxed">{entry.whenNotToUse}</p>
            </CardContent>
          </Card>
        </div>

        {entry.vietnamContext && (
          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader>
              <CardTitle className="normal-case flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-red-400" />
                Bối cảnh Việt Nam
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-300 leading-relaxed">{entry.vietnamContext}</p>
            </CardContent>
          </Card>
        )}

        {entry.sections && entry.sections.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              Chuyên sâu ({entry.sections.length} phần)
            </h3>
            {entry.sections.map((section) => (
              <Card key={section.id} id={section.id} className="border-purple-500/10">
                <CardHeader className="pb-2">
                  <CardTitle className="normal-case text-sm text-purple-300">
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="space-y-1.5 pt-1 border-t border-slate-800/50">
                      {section.bullets.map((b) => (
                        <li key={b} className="text-xs text-slate-400 flex items-start gap-2">
                          <span className="text-purple-400 mt-0.5 shrink-0">•</span>
                          <span className="leading-relaxed">{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div id="concepts" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="normal-case">
                Khái niệm cốt lõi ({entry.keyConcepts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {entry.keyConcepts.map((c) => (
                  <li key={c} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5 shrink-0">▸</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="normal-case">
                Ứng dụng thực tiễn ({entry.applications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {entry.applications.map((a) => (
                  <li key={a} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {entry.simulationModels && entry.simulationModels.length > 0 && (
          <KnowledgeSimulator models={entry.simulationModels} />
        )}

        {entry.stepByStep.length > 0 && (
          <Card id="steps">
            <CardHeader>
              <CardTitle className="normal-case flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-blue-400" />
                Quy trình từng bước
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {entry.stepByStep.map((step, i) => (
                  <li key={i} className="flex gap-3 text-xs text-slate-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-[10px] font-bold text-blue-400">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        {entry.formulas && entry.formulas.length > 0 && (
          <Card id="formulas" className="glow-blue">
            <CardHeader>
              <CardTitle className="normal-case flex items-center gap-2">
                <Calculator className="h-4 w-4 text-blue-400" />
                Công thức & Mô hình ({entry.formulas.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {entry.formulas.map((f) => (
                <div key={f.name} className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                  <p className="text-xs font-semibold text-slate-200">{f.name}</p>
                  <p className="text-lg font-mono text-blue-400 mt-1">{f.expression}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{f.variables}</p>
                  {f.example && (
                    <p className="text-[10px] text-teal-400/80 mt-2 font-mono">VD: {f.example}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {entry.metrics && entry.metrics.length > 0 && (
          <Card id="metrics">
            <CardHeader>
              <CardTitle className="normal-case flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-teal-400" />
                KPI & Benchmark
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="text-left py-2 pr-4">Chỉ số</th>
                    <th className="text-left py-2 pr-4">Công thức</th>
                    <th className="text-left py-2 pr-4">Benchmark</th>
                    <th className="text-left py-2">Diễn giải</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.metrics.map((m) => (
                    <tr key={m.name} className="border-b border-slate-800/50">
                      <td className="py-2.5 pr-4 font-medium text-slate-200">{m.name}</td>
                      <td className="py-2.5 pr-4 font-mono text-blue-400/80">{m.formula}</td>
                      <td className="py-2.5 pr-4 text-emerald-400/80">{m.benchmark}</td>
                      <td className="py-2.5 text-slate-400">{m.interpretation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {entry.caseStudies && entry.caseStudies.length > 0 && (
          <div id="cases" className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Case study thực tế</h3>
            {entry.caseStudies.map((cs) => (
              <Card key={cs.title} className="border-teal-500/20">
                <CardContent className="p-4 space-y-2">
                  <p className="text-sm font-semibold text-teal-400">{cs.title}</p>
                  <p className="text-[11px] text-slate-500">
                    <strong className="text-slate-400">Bối cảnh:</strong> {cs.context}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    <strong>Thách thức:</strong> {cs.challenge}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    <strong>Giải pháp:</strong> {cs.solution}
                  </p>
                  <p className="text-[11px] text-emerald-400">
                    <strong>Kết quả:</strong> {cs.result}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {entry.faq && entry.faq.length > 0 && (
          <Card id="faq">
            <CardHeader>
              <CardTitle className="normal-case flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-blue-400" />
                Câu hỏi thường gặp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {entry.faq.map((f) => (
                <div key={f.question} className="border-b border-slate-800/50 pb-3 last:border-0">
                  <p className="text-xs font-semibold text-slate-200">{f.question}</p>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{f.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {entry.glossary && entry.glossary.length > 0 && (
          <Card id="glossary">
            <CardHeader>
              <CardTitle className="normal-case">Bảng thuật ngữ</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {entry.glossary.map((g) => (
                <div key={g.term} className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/50">
                  <p className="text-xs font-mono font-bold text-teal-400">{g.term}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{g.definition}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {entry.pitfalls.length > 0 && (
          <Card id="pitfalls" className="border-amber-500/20 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="normal-case flex items-center gap-2 text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                Sai lầm thường gặp — tránh!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {entry.pitfalls.map((p) => (
                  <li key={p} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-amber-400 shrink-0">⚠</span>
                    {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card id="implement">
          <CardHeader>
            <CardTitle className="normal-case">Phương pháp & Triển khai</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-2">Phương pháp</p>
              <div className="flex flex-wrap gap-1.5">
                {entry.methods.map((m) => (
                  <Badge key={m} variant="secondary" className="text-[10px]">
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-2">Tech stack</p>
              <div className="flex flex-wrap gap-1.5">
                {entry.pythonStack.map((lib) => (
                  <Badge key={lib} variant="teal" className="text-[10px] font-mono">
                    {lib}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
              <strong className="text-slate-300">Lưu ý triển khai:</strong> {entry.implementationNotes}
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
    </div>
  );
}