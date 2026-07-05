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
} from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { MarketWatchTable } from "@/components/dashboard/MarketWatchTable";
import { PageHeader } from "@/components/layout/PageHeader";
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

export default function HomePage() {
  const platformStats = getCompletionStats();
  const phases = getEnrichedPhases();
  const stats = [
    { icon: Layers, label: `${platformStats.moduleCount} Module`, value: "Chuyên sâu" },
    { icon: BookOpen, label: `${platformStats.totalLessons} Bài học`, value: "Thực hành" },
    { icon: Zap, label: `${platformStats.toolCount} Công cụ`, value: "Tương tác" },
    { icon: Target, label: `${platformStats.knowledgeCount} Chủ đề`, value: "Tri thức" },
  ];
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <PageHeader
        title="Tổng quan Logistics"
        subtitle="MARKET OVERVIEW — Chỉ số hiệu suất chuỗi cung ứng thời gian thực"
        badge="DEMO DATA"
        badgeVariant="success"
        icon={<BarChart3 className="h-5 w-5" />}
        actions={
          <Button size="sm" variant="outline" asChild className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10">
            <Link href="/notebook">
              <BookMarked className="h-3.5 w-3.5" />
              Notebook mới
            </Link>
          </Button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-teal-500/20"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-teal-950/40 via-slate-900/80 to-blue-950/30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/60 to-transparent" />
        <div className="relative z-10 p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 border border-teal-500/30">
                <BookMarked className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-100">LogIQ Notebook</h2>
                  <Badge variant="teal" className="text-[9px]">NotebookLM-style</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                  Upload PDF, Word, slide — hỏi đáp thông minh kèm trích dẫn, tự tạo tóm tắt,
                  flashcard và quiz. Học logistics từ tài liệu thật của bạn.
                </p>
                <div className="flex flex-wrap gap-3 mt-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><Upload className="h-3 w-3 text-teal-500" /> PDF · DOCX · TXT</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3 text-teal-500" /> Chat + trích dẫn</span>
                </div>
              </div>
            </div>
            <Button asChild className="shrink-0 bg-teal-600 hover:bg-teal-500">
              <Link href="/notebook">
                Bắt đầu upload
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {dashboardKPIs.map((kpi, i) => (
          <KPICard key={kpi.id} kpi={kpi} index={i} />
        ))}
      </div>

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
          <CardTitle>Market Watch — Theo dõi chỉ số SC</CardTitle>
          <Badge variant="secondary" className="text-[10px] font-mono">
            10 metrics
          </Badge>
        </CardHeader>
        <CardContent className="pt-2">
          <MarketWatchTable data={marketWatchData} />
        </CardContent>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-slate-800/60"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-slate-900/80 to-teal-950/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#3b82f615,transparent_50%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        <div className="relative z-10 p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <Badge variant="teal" className="mb-3 text-[10px]">
                Nền tảng #1 Logistics Education
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                <span className="gradient-text">LogIQ</span>
              </h2>
              <p className="text-sm text-teal-400/90 mt-2 font-medium">
                Học Logistics & Supply Chain một cách chuyên nghiệp và thực tiễn
              </p>
              <p className="text-sm text-slate-400 mt-4 leading-relaxed max-w-lg">
                Nền tảng học tập toàn diện kết hợp lý thuyết tiếng Việt, code Python
                thực hành, công cụ mô phỏng tương tác, và dashboard phân tích chuyên nghiệp
                — giống các nền tảng tài chính hàng đầu thế giới.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Button size="lg" asChild>
                  <Link href="/learn">
                    <BookOpen className="h-4 w-4" />
                    Bắt đầu học
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/tools">
                    <Zap className="h-4 w-4" />
                    Thử công cụ
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60 backdrop-blur-sm"
                >
                  <stat.icon className="h-5 w-5 text-blue-400 mb-2" />
                  <p className="text-lg font-bold text-slate-100">{stat.label}</p>
                  <p className="text-xs text-slate-500">{stat.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>{phases.length} Giai đoạn học tập</CardTitle>
            <Link href="/roadmap" className="text-[10px] text-blue-400 hover:underline font-medium">
              Xem lộ trình đầy đủ →
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
                  whileHover={{ y: -3 }}
                >
                  <Link href={`/roadmap/${phase.id}`}>
                    <Card
                      className="card-accent hover:border-slate-600 transition-all h-full group"
                      style={{ "--accent-color": phase.color } as CSSProperties}
                    >
                      <CardContent className="p-3.5">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white shadow-lg"
                            style={{
                              backgroundColor: phase.color,
                              boxShadow: `${phase.color}30 0px 4px 12px`,
                            }}
                          >
                            {phase.number}
                          </span>
                          <Badge variant="secondary" className="text-[9px]">
                            {phase.duration}
                          </Badge>
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

        <Card>
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
              <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10 text-center">
                <p className="text-lg font-bold text-blue-400 font-mono">{platformStats.completedLessons}</p>
                <p className="text-[10px] text-slate-500">Bài đã học</p>
              </div>
              <div className="p-2.5 rounded-lg bg-teal-500/5 border border-teal-500/10 text-center">
                <p className="text-lg font-bold text-teal-400 font-mono">{platformStats.percent}%</p>
                <p className="text-[10px] text-slate-500">Tiến độ học</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}