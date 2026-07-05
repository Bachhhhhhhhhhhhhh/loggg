"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BarChart3,
  Zap,
  Target,
  Layers,
  BookMarked,
  Upload,
  MessageSquare,
  Database,
  Globe,
  Sparkles,
  Brain,
  TrendingUp,
} from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { MarketWatchTable } from "@/components/dashboard/MarketWatchTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DeliveryTrendChart,
  CostBreakdownChart,
  InventoryChart,
  GenericBarChart,
} from "@/components/charts/ChartComponents";
import { dashboardKPIs, chartData, marketWatchData } from "@/data/kpis";
import { getCompletionStats, getEnrichedPhases } from "@/lib/progress";
import { knowledgeStats } from "@/data/knowledge";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const bentoFeatures = [
  {
    href: "/notebook",
    title: "Notebook AI",
    subtitle: "Upload PDF · Chat thông minh · Studio",
    desc: "NotebookLM-style — hỏi đáp kèm trích dẫn, tóm tắt, flashcard, quiz từ tài liệu của bạn.",
    icon: BookMarked,
    color: "#14b8a6",
    badge: "AI",
    span: "lg:col-span-2 lg:row-span-2",
    large: true,
  },
  {
    href: "/resources",
    title: "Tri thức",
    subtitle: `${knowledgeStats.topics} chủ đề · ${knowledgeStats.sections} phần chuyên sâu`,
    desc: "ABC, EOQ, WMS, Incoterms, Forecast...",
    icon: Database,
    color: "#8b5cf6",
    badge: "32 topics",
    span: "",
    large: false,
  },
  {
    href: "/learn",
    title: "Học tập",
    subtitle: "Module + Python thực hành",
    desc: "Lý thuyết tiếng Việt, code chạy được.",
    icon: BookOpen,
    color: "#3b82f6",
    badge: "6 modules",
    span: "",
    large: false,
  },
  {
    href: "/tools",
    title: "Công cụ",
    subtitle: "EOQ · ABC · Simulator",
    desc: "Tính toán & mô phỏng tương tác.",
    icon: Zap,
    color: "#f59e0b",
    badge: "Live",
    span: "",
    large: false,
  },
  {
    href: "/incoterms",
    title: "Incoterms 2020",
    subtitle: "11 điều khoản · Landed cost",
    desc: "FOB, CIF, DDP — hướng dẫn đầy đủ.",
    icon: Globe,
    color: "#0ea5e9",
    badge: "ICC",
    span: "",
    large: false,
  },
];

export default function HomePage() {
  const platformStats = getCompletionStats();
  const phases = getEnrichedPhases();
  const stats = [
    { icon: Layers, label: `${platformStats.moduleCount}`, sub: "Module" },
    { icon: BookOpen, label: `${platformStats.totalLessons}`, sub: "Bài học" },
    { icon: Zap, label: `${platformStats.toolCount}`, sub: "Công cụ" },
    { icon: Target, label: `${platformStats.knowledgeCount}`, sub: "Tri thức" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-8">
      {/* ── HERO ── */}
      <motion.section
        {...fadeUp}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-slate-800/60"
      >
        <div className="hero-orb w-72 h-72 bg-blue-500/20 -top-20 -left-20" style={{ animationDelay: "0s" }} />
        <div className="hero-orb w-56 h-56 bg-teal-500/15 top-10 right-10" style={{ animationDelay: "2s" }} />
        <div className="hero-orb w-40 h-40 bg-violet-500/15 bottom-0 left-1/3" style={{ animationDelay: "4s" }} />

        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/90" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

        <div className="relative z-10 p-8 sm:p-12 lg:p-14">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Badge variant="teal" className="gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-live" />
              Platform 2026
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              Next.js 16 · React 19 · AI
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            <span className="gradient-text">LogIQ</span>
            <br />
            <span className="text-slate-200 text-3xl sm:text-4xl lg:text-5xl font-semibold">
              Logistics Intelligence
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
            Nền tảng học Supply Chain tối tân — Notebook AI, tri thức chuyên sâu,
            công cụ mô phỏng, dashboard phân tích như terminal tài chính hàng đầu.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <Button size="lg" asChild className="shadow-lg shadow-blue-500/25">
              <Link href="/notebook">
                <Sparkles className="h-4 w-4" />
                Notebook AI
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/learn">
                <BookOpen className="h-4 w-4" />
                Bắt đầu học
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild className="text-slate-400">
              <Link href="/resources">
                <Brain className="h-4 w-4" />
                Khám phá tri thức
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 pt-8 border-t border-slate-800/60">
            {stats.map((s, i) => (
              <motion.div
                key={s.sub}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="text-center sm:text-left"
              >
                <p className="text-2xl sm:text-3xl font-bold text-slate-100 font-mono">{s.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── BENTO GRID ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Khám phá nền tảng
          </h2>
          <Badge variant="secondary" className="text-[10px]">Bento layout</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-[minmax(140px,auto)]">
          {bentoFeatures.map((f, i) => (
            <motion.div
              key={f.href}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className={f.span}
            >
              <Link href={f.href} className="block h-full">
                <div
                  className={`bento-item h-full p-5 ${f.large ? "min-h-[280px]" : "min-h-[140px]"}`}
                  style={{ "--bento-color": f.color } as CSSProperties}
                >
                  <div className="bento-glow" />
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl border"
                        style={{
                          backgroundColor: `${f.color}15`,
                          borderColor: `${f.color}30`,
                          color: f.color,
                        }}
                      >
                        <f.icon className="h-5 w-5" />
                      </div>
                      <Badge variant="secondary" className="text-[9px]">{f.badge}</Badge>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mt-4">{f.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{f.subtitle}</p>
                    {f.large && (
                      <>
                        <p className="text-xs text-slate-400 mt-3 leading-relaxed flex-1">{f.desc}</p>
                        <div className="flex flex-wrap gap-2 mt-4 text-[10px] text-slate-600">
                          <span className="flex items-center gap-1">
                            <Upload className="h-3 w-3" style={{ color: f.color }} /> PDF · DOCX
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" style={{ color: f.color }} /> Chat + cite
                          </span>
                        </div>
                      </>
                    )}
                    {!f.large && (
                      <p className="text-[11px] text-slate-500 mt-2">{f.desc}</p>
                    )}
                    <div className="flex items-center gap-1 mt-auto pt-3 text-[11px] font-medium" style={{ color: f.color }}>
                      Mở <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── KPI DASHBOARD ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Market Overview
          </h2>
          <Badge variant="success" className="text-[9px] ml-auto">LIVE DEMO</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {dashboardKPIs.map((kpi, i) => (
            <KPICard key={kpi.id} kpi={kpi} index={i} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 glow-blue">
          <CardHeader>
            <CardTitle>Xu hướng OTD</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <DeliveryTrendChart data={chartData.deliveryTrend} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Cơ cấu chi phí SC</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <CostBreakdownChart data={chartData.costBreakdown} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-1 glow-teal">
          <CardHeader>
            <CardTitle>Mức tồn kho</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <InventoryChart data={chartData.inventoryLevels} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
            Market Watch
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] font-mono">10 metrics</Badge>
        </CardHeader>
        <CardContent className="pt-2">
          <MarketWatchTable data={marketWatchData} />
        </CardContent>
      </Card>

      {/* ── ROADMAP + ACTIVITY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>{phases.length} Giai đoạn học tập</CardTitle>
            <Link href="/roadmap" className="text-[10px] text-blue-400 hover:underline font-medium">
              Xem lộ trình →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {phases.map((phase, i) => (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/roadmap/${phase.id}`}>
                    <Card
                      className="card-accent hover:border-slate-600 transition-all h-full group"
                      style={{ "--accent-color": phase.color } as CSSProperties}
                    >
                      <CardContent className="p-3.5">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
                            style={{
                              backgroundColor: phase.color,
                              boxShadow: `${phase.color}40 0px 4px 14px`,
                            }}
                          >
                            {phase.number}
                          </span>
                          <Badge variant="secondary" className="text-[9px]">{phase.duration}</Badge>
                        </div>
                        <h3 className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors leading-tight">
                          {phase.title}
                        </h3>
                        <p className="text-[10px] text-slate-600 mt-1">{phase.subtitle}</p>
                        <div className="mt-3">
                          <div className="flex justify-between text-[9px] text-slate-600 mb-1 font-mono">
                            <span>{phase.lessons} bài</span>
                            <span>{phase.progress}%</span>
                          </div>
                          <Progress value={phase.progress} color={phase.color} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glow-violet">
          <CardHeader>
            <CardTitle>Hoạt động tuần này</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <GenericBarChart
              data={chartData.weeklyActivity}
              xKey="day"
              bars={[
                { key: "lessons", name: "Bài học", color: "#3B82F6" },
                { key: "tools", name: "Công cụ", color: "#14B8A6" },
              ]}
              height={200}
            />
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="p-3 rounded-xl bg-blue-500/8 border border-blue-500/15 text-center">
                <p className="text-xl font-bold text-blue-400 font-mono">{platformStats.completedLessons}</p>
                <p className="text-[10px] text-slate-500">Bài đã học</p>
              </div>
              <div className="p-3 rounded-xl bg-teal-500/8 border border-teal-500/15 text-center">
                <p className="text-xl font-bold text-teal-400 font-mono">{platformStats.percent}%</p>
                <p className="text-[10px] text-slate-500">Tiến độ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}