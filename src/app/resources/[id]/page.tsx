import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { KnowledgeArticle } from "@/components/resources/KnowledgeArticle";
import { knowledgeBase, getKnowledgeEntry } from "@/data/knowledge-base";

export function generateStaticParams() {
  return knowledgeBase.map((k) => ({ id: k.id }));
}

export default async function KnowledgeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = getKnowledgeEntry(id);
  if (!entry) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <Link
        href="/resources"
        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-blue-400 transition-colors"
      >
        <ArrowLeft className="h-3 w-3" />
        Quay lại Thư viện tri thức
      </Link>
      <KnowledgeArticle entry={entry} />
    </div>
  );
}