"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookMarked,
  Plus,
  Trash2,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Upload,
  Brain,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { createId } from "@/lib/notebook/id";
import { listNotebooks, saveNotebook, deleteNotebook } from "@/lib/notebook/storage";
import type { Notebook } from "@/lib/notebook/types";
import { NotebookSettingsDialog } from "@/components/notebook/NotebookSettingsDialog";

const EMOJIS = ["📦", "🚢", "📊", "🎓", "📋", "🌐", "⚡", "🔬"];

const features = [
  {
    icon: Upload,
    title: "Upload tài liệu",
    desc: "PDF, Word, TXT, Markdown, CSV — xử lý ngay trên trình duyệt",
  },
  {
    icon: MessageSquare,
    title: "Hỏi đáp thông minh",
    desc: "Đặt câu hỏi và nhận câu trả lời kèm trích dẫn từ file",
  },
  {
    icon: Brain,
    title: "Studio học tập",
    desc: "Tóm tắt, dàn ý, flashcard, quiz tự động từ nội dung",
  },
  {
    icon: Layers,
    title: "Đa nguồn",
    desc: "Kết hợp nhiều tài liệu trong một notebook như NotebookLM",
  },
];

export default function NotebookHubPage() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    listNotebooks().then((nbs) => {
      setNotebooks(nbs);
      setLoading(false);
    });
  }, []);

  const createNotebook = async () => {
    const title = newTitle.trim() || `Notebook ${notebooks.length + 1}`;
    const nb: Notebook = {
      id: createId("nb"),
      title,
      description: "Học từ tài liệu upload",
      emoji: EMOJIS[notebooks.length % EMOJIS.length],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sources: [],
      messages: [],
      insights: null,
    };
    await saveNotebook(nb);
    setNotebooks((prev) => [nb, ...prev]);
    setNewTitle("");
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa notebook này? Dữ liệu lưu trên trình duyệt sẽ mất.")) return;
    await deleteNotebook(id);
    setNotebooks((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <PageHeader
        title="LogIQ Notebook"
        subtitle="NOTEBOOKLM-STYLE — Upload tài liệu & học thông minh từ file của bạn"
        badge="MỚI"
        badgeVariant="teal"
        icon={<BookMarked className="h-5 w-5" />}
        actions={<NotebookSettingsDialog />}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-slate-800/60"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950/30 via-slate-900/90 to-blue-950/30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />
        <div className="relative z-10 p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <Badge variant="teal" className="text-[10px] mb-3">
                <Sparkles className="h-3 w-3 mr-1" />
                Giống NotebookLM — 100% trên trình duyệt
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
                Học Logistics từ <span className="gradient-text">tài liệu của bạn</span>
              </h2>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed max-w-lg">
                Upload slide, PDF giáo trình, báo cáo SCM — LogIQ tự động phân tích,
                trả lời câu hỏi kèm trích dẫn, tạo flashcard và quiz. Dữ liệu lưu
                cục bộ, không cần server.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60"
                >
                  <f.icon className="h-5 w-5 text-teal-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-200">{f.title}</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Notebook của bạn</h3>
          <p className="text-[10px] text-slate-600 font-mono">
            {notebooks.length} notebook · lưu trên IndexedDB trình duyệt
          </p>
        </div>
        {creating ? (
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              placeholder="Tên notebook…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createNotebook()}
              className="w-full sm:w-48 bg-slate-900/60"
              autoFocus
            />
            <Button onClick={createNotebook}>Tạo</Button>
            <Button variant="outline" onClick={() => setCreating(false)}>
              Hủy
            </Button>
          </div>
        ) : (
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Notebook mới
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">Đang tải…</div>
      ) : notebooks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <BookMarked className="h-12 w-12 mx-auto text-slate-700 mb-3" />
            <p className="text-sm text-slate-400">Chưa có notebook nào</p>
            <p className="text-xs text-slate-600 mt-1 mb-4">
              Tạo notebook đầu tiên và upload tài liệu logistics để bắt đầu học
            </p>
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              Tạo notebook đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notebooks.map((nb, i) => (
            <motion.div
              key={nb.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="group hover:border-slate-600 transition-all h-full glow-teal">
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl">{nb.emoji}</span>
                    <button
                      onClick={() => handleDelete(nb.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200 mt-2 group-hover:text-teal-400 transition-colors">
                    {nb.title}
                  </h4>
                  <p className="text-[10px] text-slate-600 mt-1 flex-1">{nb.description}</p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <Badge variant="secondary" className="text-[9px]">
                      <FileText className="h-2.5 w-2.5 mr-0.5" />
                      {nb.sources.length} tài liệu
                    </Badge>
                    <Badge variant="secondary" className="text-[9px]">
                      <MessageSquare className="h-2.5 w-2.5 mr-0.5" />
                      {nb.messages.length} tin nhắn
                    </Badge>
                    {nb.insights && (
                      <Badge variant="teal" className="text-[9px]">
                        Studio ready
                      </Badge>
                    )}
                  </div>

                  <p className="text-[9px] text-slate-700 font-mono mt-2">
                    {new Date(nb.updatedAt).toLocaleDateString("vi-VN")}
                  </p>

                  <Button asChild className="mt-3 w-full" size="sm">
                    <Link href={`/notebook/workspace?id=${nb.id}`}>
                      Mở workspace
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}