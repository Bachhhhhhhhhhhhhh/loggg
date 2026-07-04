import Link from "next/link";
import { BookOpen, Target, Heart, User } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { knowledgeBase } from "@/data/knowledge-base";

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
                <strong className="text-slate-100">LogIQ</strong> tích hợp toàn bộ kiến thức từ
                các framework và phương pháp chuẩn ngành trực tiếp trên nền tảng — lý thuyết
                tiếng Việt, công thức khoa học, code Python, công cụ mô phỏng, không cần tra cứu
                nguồn bên ngoài.
              </p>
              <p>
                Giao diện dashboard phân tích chuyên nghiệp tạo môi trường học nghiêm túc,
                data-driven — phù hợp bản chất ngành Logistics.
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
                Đào tạo chuyên gia chuỗi cung ứng có khả năng phân tích dữ liệu, áp dụng công nghệ,
                và giải quyết bài toán thực tế bằng phương pháp khoa học.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-400" />
            Cơ sở tri thức tích hợp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {knowledgeBase.map((entry) => (
              <Link
                key={entry.id}
                href={`/resources/${entry.id}`}
                className="p-3 rounded-lg hover:bg-slate-800/50 transition-colors border border-slate-800 hover:border-slate-700"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-[9px]">{entry.category}</Badge>
                </div>
                <p className="text-sm text-slate-200 font-medium">{entry.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{entry.summary}</p>
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <Link href="/incoterms/" className="inline-flex items-center gap-1 text-xs text-teal-400 hover:underline">
              Incoterms® 2020 đầy đủ →
            </Link>
            <Link href="/resources/" className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline">
              <BookOpen className="h-3 w-3" />
              Thư viện tri thức →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}