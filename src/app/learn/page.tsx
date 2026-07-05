"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, BarChart3, Network, Package, Warehouse, Brain, Globe } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { modules } from "@/data/modules";
import { getCompletionStats, getModuleProgress } from "@/lib/progress";

const iconMap: Record<string, ElementType> = {
  BarChart3,
  Network,
  Package,
  Warehouse,
  Brain,
  Globe,
};

export default function LearnPage() {
  const { totalLessons, completedLessons, percent } = getCompletionStats();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <PageHeader
        variant="hero"
        eyebrow="Learning Path"
        title="Học tập"
        subtitle={`${modules.length} MODULE · ${totalLessons} BÀI HỌC · ${completedLessons} HOÀN THÀNH`}
        badge={`${percent}%`}
        badgeVariant="teal"
        icon={<BookOpen className="h-5 w-5" />}
      />

      <SectionHeader
        eyebrow="Curriculum"
        title="Module học tập"
        description="Lý thuyết tiếng Việt kèm code Python thực hành — theo dõi tiến độ từng module."
        className="mb-2"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod, i) => {
          const Icon = iconMap[mod.icon] || BookOpen;
          const { completed, total, percent: modPercent } = getModuleProgress(mod);

          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={`/learn/${mod.id}/${mod.lessons[0].id}`}>
                <Card className="pro-surface-hover transition-all h-full group">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 shrink-0 group-hover:bg-blue-500/20 transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                          {mod.title}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {mod.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>{completed}/{total} bài học</span>
                        <span>{modPercent}%</span>
                      </div>
                      <Progress value={modPercent} color="#14B8A6" />
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {mod.lessons.slice(0, 3).map((l) => (
                        <Badge key={l.id} variant={l.completed ? "success" : "secondary"} className="text-[10px]">
                          {l.title.length > 25 ? l.title.slice(0, 25) + "…" : l.title}
                        </Badge>
                      ))}
                      {mod.lessons.length > 3 && (
                        <Badge variant="secondary" className="text-[10px]">
                          +{mod.lessons.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}