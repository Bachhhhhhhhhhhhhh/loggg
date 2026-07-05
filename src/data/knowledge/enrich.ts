import type { KnowledgeEntry } from "./types";

type Enrichment = Partial<
  Pick<
    KnowledgeEntry,
    | "overview"
    | "scientificBasis"
    | "whenToUse"
    | "whenNotToUse"
    | "vietnamContext"
    | "keyConcepts"
    | "applications"
    | "methods"
    | "stepByStep"
    | "pitfalls"
    | "formulas"
    | "metrics"
    | "caseStudies"
    | "faq"
    | "glossary"
    | "sections"
    | "implementationNotes"
  >
>;

function appendText(base: string, extra?: string): string {
  if (!extra) return base;
  return base.includes(extra.slice(0, 40)) ? base : `${base}\n\n${extra}`;
}

function mergeList<T>(base: T[] | undefined, extra: T[] | undefined): T[] {
  if (!extra?.length) return base ?? [];
  const combined = [...(base ?? []), ...extra];
  return [...new Set(combined)];
}

export function enrichEntry(entry: KnowledgeEntry, extra?: Enrichment): KnowledgeEntry {
  if (!extra) return entry;
  return {
    ...entry,
    overview: appendText(entry.overview, extra.overview),
    scientificBasis: appendText(entry.scientificBasis, extra.scientificBasis),
    whenToUse: appendText(entry.whenToUse, extra.whenToUse),
    whenNotToUse: appendText(entry.whenNotToUse, extra.whenNotToUse),
    vietnamContext: extra.vietnamContext
      ? appendText(entry.vietnamContext ?? "", extra.vietnamContext)
      : entry.vietnamContext,
    keyConcepts: mergeList(entry.keyConcepts, extra.keyConcepts),
    applications: mergeList(entry.applications, extra.applications),
    methods: mergeList(entry.methods, extra.methods),
    stepByStep: mergeList(entry.stepByStep, extra.stepByStep),
    pitfalls: mergeList(entry.pitfalls, extra.pitfalls),
    formulas: mergeList(entry.formulas, extra.formulas),
    metrics: mergeList(entry.metrics, extra.metrics),
    caseStudies: mergeList(entry.caseStudies, extra.caseStudies),
    faq: mergeList(entry.faq, extra.faq),
    glossary: mergeList(entry.glossary, extra.glossary),
    sections: mergeList(entry.sections, extra.sections),
    implementationNotes: appendText(entry.implementationNotes, extra.implementationNotes),
  };
}