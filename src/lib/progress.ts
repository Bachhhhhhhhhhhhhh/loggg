import { modules, type Module } from "@/data/modules";
import { phases, type Phase } from "@/data/roadmap";
import { knowledgeBase } from "@/data/knowledge-base";

export const PHASE_MODULE_MAP: Record<string, string> = {
  foundation: "abc-analysis",
  optimization: "linear-programming",
  inventory: "inventory-management",
  warehouse: "warehouse-logistics",
  ml: "machine-learning",
};

export const TOOL_COUNT = 4;

export function getModuleProgress(mod: Module) {
  const completed = mod.lessons.filter((l) => l.completed).length;
  const total = mod.lessons.length;
  return {
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export function getCompletionStats() {
  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
  const completedLessons = modules.reduce(
    (s, m) => s + m.lessons.filter((l) => l.completed).length,
    0
  );
  return {
    moduleCount: modules.length,
    totalLessons,
    completedLessons,
    knowledgeCount: knowledgeBase.length,
    toolCount: TOOL_COUNT,
    percent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
  };
}

export function getPhaseProgress(phaseId: string) {
  const moduleId = PHASE_MODULE_MAP[phaseId];
  const mod = modules.find((m) => m.id === moduleId);
  if (!mod) return { lessons: 0, progress: 0 };
  const { total, percent } = getModuleProgress(mod);
  return { lessons: total, progress: percent };
}

export type EnrichedPhase = Phase & { lessons: number; progress: number };

export function getEnrichedPhases(): EnrichedPhase[] {
  return phases.map((phase) => {
    const { lessons, progress } = getPhaseProgress(phase.id);
    return { ...phase, lessons, progress };
  });
}