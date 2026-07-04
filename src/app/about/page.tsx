import Link from "next/link";
import { GitBranch, BookOpen, Target, Heart, User } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { githubRepos } from "@/data/resources";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <PageHeader
        title="Về tác giả"
        subtitle="BRIAN BACH TRUONG — FOUNDER & EDUCATOR"
        badge="LOGIQ"
        icon={<User className="h-5 w-5" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-teal-500 text-3xl font-bold text-white">
              BT
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-4">Brian Bach Truong</h2>
            <p className="text-sm text-teal-400">Founder & Educator</p>
            <p className="text-xs text-slate-500 mt-2">Logistics & Supply Chain Specialist</p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="default">Python</Badge>
              <Badge variant="teal">Supply Chain</Badge>
              <Badge variant="success">Analytics</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-400" />
                Lý do xây dựng LogIQ
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 leading-relaxed space-y-3">
              <p>
                Logistics và Supply Chain Management là lĩnh vực đòi hỏi sự kết hợp giữa tư duy
                phân tích, kỹ năng lập trình, và hiểu biết thực tiễn. Tuy nhiên, hầu hết tài liệu
                học tập hiện có hoặc quá học thuật, hoặc thiếu tính thực hành.
              </p>
              <p>
                <strong className="text-slate-100">LogIQ</strong> được xây dựng để lấp đầy khoảng trống đó —
                một nền tảng học tập kết hợp lý thuyết tiếng Việt dễ hiểu, code Python thực hành,
                công cụ tương tác, và tài nguyên open-source chất lượng cao.
              </p>
              <p>
                Giao diện được thiết kế theo phong cách dashboard phân tích chuyên nghiệp (giống
                các nền tảng tài chính) để tạo cảm giác nghiêm túc, data-driven — phù hợp với
                bản chất của ngành Logistics.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-400" />
                Sứ mệnh
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 leading-relaxed">
              <p>
                &ldquo;Học Logistics & Supply Chain một cách chuyên nghiệp và thực tiễn&rdquo; —
                Đào tạo thế hệ chuyên gia chuỗi cung ứng có khả năng phân tích dữ liệu,
                áp dụng công nghệ, và giải quyết bài toán thực tế.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-slate-400" />
            Nguồn tham khảo chính
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {githubRepos.slice(0, 6).map((repo) => (
              <a
                key={repo.id}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors border border-slate-800 hover:border-slate-700"
              >
                <GitBranch className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-blue-400 font-medium">
                    {repo.owner}/{repo.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{repo.description}</p>
                </div>
              </a>
            ))}
          </div>
          <Link
            href="/resources"
            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline mt-4"
          >
            <BookOpen className="h-3 w-3" />
            Xem tất cả tài nguyên →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}