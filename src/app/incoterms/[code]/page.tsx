import { notFound } from "next/navigation";
import { IncotermDetailView } from "@/components/incoterms/IncotermDetailView";
import { incoterms, getIncoterm } from "@/data/incoterms";

export function generateStaticParams() {
  return incoterms.map((t) => ({ code: t.code.toLowerCase() }));
}

export default async function IncotermDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const term = getIncoterm(code);
  if (!term) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <IncotermDetailView term={term} />
    </div>
  );
}