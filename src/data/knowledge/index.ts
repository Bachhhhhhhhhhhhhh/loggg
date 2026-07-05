import { analyticsEntries } from "./entries-analytics";
import { operationsEntries } from "./entries-operations";
import { advancedEntries } from "./entries-advanced";
import { forecastingEntries } from "./entries-forecasting";
import { fundamentalsEntries } from "./entries-fundamentals";
import { advancedModelEntries } from "./entries-advanced-models";
import { deepEnrichment } from "./deep-enrichment";
import { contentExpansion } from "./content-expansion";
import { simulationByEntry } from "./simulation-config";
import { enrichEntry } from "./enrich";
import type { KnowledgeEntry, KnowledgeCategory } from "./types";

export type {
  KnowledgeEntry,
  KnowledgeCategory,
  KnowledgeFormula,
  KnowledgeCaseStudy,
  KnowledgeFAQ,
  KnowledgeGlossaryItem,
  KnowledgeMetric,
  KnowledgeSection,
  KnowledgeDifficulty,
  KnowledgeSimulationModel,
  SimulationModelType,
} from "./types";

const rawKnowledgeBase: KnowledgeEntry[] = [
  ...analyticsEntries,
  ...operationsEntries,
  ...advancedEntries,
  ...forecastingEntries,
  ...fundamentalsEntries,
  ...advancedModelEntries,
];

export const knowledgeBase: KnowledgeEntry[] = rawKnowledgeBase.map((k) => {
  let entry = enrichEntry(k, deepEnrichment[k.id]);
  entry = enrichEntry(entry, contentExpansion[k.id]);
  if (simulationByEntry[k.id]) {
    entry = enrichEntry(entry, { simulationModels: simulationByEntry[k.id] });
  }
  return entry;
});

export function getKnowledgeEntry(id: string): KnowledgeEntry | undefined {
  return knowledgeBase.find((k) => k.id === id);
}

export function getKnowledgeByModule(moduleId: string): KnowledgeEntry[] {
  return knowledgeBase.filter((k) => k.relatedModuleIds.includes(moduleId));
}

export function getKnowledgeByCategory(category: KnowledgeCategory): KnowledgeEntry[] {
  return knowledgeBase.filter((k) => k.category === category);
}

function entrySearchText(k: KnowledgeEntry): string {
  return [
    k.title,
    k.subtitle,
    k.summary,
    k.overview,
    k.scientificBasis,
    k.vietnamContext ?? "",
    ...(k.tags ?? []),
    ...k.keyConcepts,
    ...k.applications,
    ...k.methods,
    ...k.stepByStep,
    ...k.pitfalls,
    ...(k.formulas?.map((f) => `${f.name} ${f.expression} ${f.variables}`) ?? []),
    ...(k.faq?.map((f) => `${f.question} ${f.answer}`) ?? []),
    ...(k.glossary?.map((g) => `${g.term} ${g.definition}`) ?? []),
    ...(k.sections?.map((s) => `${s.title} ${s.content} ${(s.bullets ?? []).join(" ")}`) ?? []),
    ...(k.caseStudies?.map((c) => `${c.title} ${c.context} ${c.challenge} ${c.solution} ${c.result}`) ?? []),
    ...(k.simulationModels?.map((s) => `${s.title} ${s.description} ${s.scientificNote}`) ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

export function searchKnowledge(query: string): KnowledgeEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return knowledgeBase;
  const terms = q.split(/\s+/).filter(Boolean);
  return knowledgeBase.filter((k) => {
    const text = entrySearchText(k);
    return terms.every((t) => text.includes(t));
  });
}

export const knowledgeStats = {
  topics: knowledgeBase.length,
  concepts: knowledgeBase.reduce((n, k) => n + k.keyConcepts.length, 0),
  formulas: knowledgeBase.reduce((n, k) => n + (k.formulas?.length ?? 0), 0),
  caseStudies: knowledgeBase.reduce((n, k) => n + (k.caseStudies?.length ?? 0), 0),
  sections: knowledgeBase.reduce((n, k) => n + (k.sections?.length ?? 0), 0),
  faq: knowledgeBase.reduce((n, k) => n + (k.faq?.length ?? 0), 0),
  simulations: knowledgeBase.reduce((n, k) => n + (k.simulationModels?.length ?? 0), 0),
};