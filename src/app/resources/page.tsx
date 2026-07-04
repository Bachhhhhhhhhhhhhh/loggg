"use client";

import { ExternalLink, Star, Database } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { githubRepos, curatedResources } from "@/data/resources";

type RepoRow = {
  name: string;
  owner: string;
  description: string;
  stars: number;
  language: string;
  url: string;
  topics: string[];
};

const repoColumns: Column<RepoRow>[] = [
  {
    key: "name",
    header: "Repository",
    sortable: true,
    render: (r) => (
      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-medium">
        {r.owner}/{r.name}
      </a>
    ),
  },
  {
    key: "description",
    header: "Mô tả",
    className: "max-w-xs",
    render: (r) => <span className="text-slate-400 line-clamp-2">{r.description}</span>,
  },
  {
    key: "stars",
    header: "Stars",
    sortable: true,
    render: (r) => (
      <span className="flex items-center gap-1 text-amber-400 font-mono">
        <Star className="h-3 w-3 fill-amber-400" />
        {r.stars.toLocaleString()}
      </span>
    ),
  },
  {
    key: "language",
    header: "Ngôn ngữ",
    sortable: true,
    render: (r) => <Badge variant="secondary">{r.language}</Badge>,
  },
  {
    key: "topics",
    header: "Topics",
    render: (r) => (
      <div className="flex flex-wrap gap-1">
        {r.topics.slice(0, 2).map((t) => (
          <Badge key={t} variant="default" className="text-[10px]">{t}</Badge>
        ))}
      </div>
    ),
  },
];

const typeVariant: Record<string, "default" | "teal" | "success" | "warning" | "secondary"> = {
  article: "default",
  book: "teal",
  course: "success",
  tool: "warning",
  dataset: "secondary",
};

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <PageHeader
        title="Tài nguyên"
        subtitle="GITHUB REPOS · CURATED RESOURCES · AWESOME-SUPPLY-CHAIN"
        badge="OPEN SOURCE"
        icon={<Database className="h-5 w-5" />}
      />

      <Card>
        <CardHeader>
          <CardTitle>GitHub Repositories</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={githubRepos}
            columns={repoColumns}
            maxHeight="500px"
          />
        </CardContent>
      </Card>

      <div>
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
          Tài nguyên được tuyển chọn
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {curatedResources.map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="hover:border-slate-600 transition-all h-full group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={typeVariant[resource.type] || "secondary"} className="text-[10px]">
                      {resource.type}
                    </Badge>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 mt-2 group-hover:text-blue-400 transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{resource.category}</p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {resource.description}
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}