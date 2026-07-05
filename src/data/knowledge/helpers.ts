import type { KnowledgeEntry } from "./types";

type RequiredEntryFields = Pick<
  KnowledgeEntry,
  | "id"
  | "title"
  | "subtitle"
  | "category"
  | "language"
  | "difficulty"
  | "readingTime"
  | "summary"
  | "overview"
  | "scientificBasis"
  | "whenToUse"
  | "whenNotToUse"
  | "keyConcepts"
  | "applications"
  | "methods"
  | "relatedModuleIds"
>;

/** Tạo entry đầy đủ với defaults cho các trường tùy chọn */
export function entry(
  partial: Omit<RequiredEntryFields, "pythonStack" | "implementationNotes"> &
    Partial<KnowledgeEntry>
): KnowledgeEntry {
  return {
    stepByStep: [],
    pitfalls: [],
    tags: [],
    pythonStack: [],
    implementationNotes: "",
    ...partial,
  };
}