"use client";

import { useState } from "react";
import { Settings, X, Key, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { NotebookSettings } from "@/lib/notebook/types";
import { getSettings, saveSettings } from "@/lib/notebook/storage";

export function NotebookSettingsDialog() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<NotebookSettings>(getSettings);

  const handleSave = () => {
    saveSettings(settings);
    setOpen(false);
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setSettings(getSettings());
          setOpen(true);
        }}
        className="h-8 text-[10px]"
      >
        <Settings className="h-3.5 w-3.5 mr-1" />
        Cài đặt AI
      </Button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-400" />
                <h3 className="text-sm font-semibold text-slate-200">Cài đặt Notebook</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <Key className="h-3.5 w-3.5" />
                  Gemini API Key (tùy chọn)
                </label>
                <Input
                  type="password"
                  placeholder="AIza…"
                  value={settings.geminiApiKey}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, geminiApiKey: e.target.value }))
                  }
                  className="bg-slate-950/60 border-slate-800 font-mono text-xs"
                />
                <p className="text-[10px] text-slate-600 mt-1.5">
                  Lưu trên trình duyệt. Bật AI để có câu trả lời thông minh hơn NotebookLM.
                  Không có key vẫn dùng được với chế độ trích xuất.
                </p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.useAi}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, useAi: e.target.checked }))
                  }
                  className="rounded border-slate-700"
                />
                <div>
                  <p className="text-xs text-slate-300">Bật AI nâng cao</p>
                  <p className="text-[10px] text-slate-600">Dùng Gemini khi có API key</p>
                </div>
                {settings.useAi && settings.geminiApiKey && (
                  <Badge variant="success" className="text-[9px] ml-auto">
                    Active
                  </Badge>
                )}
              </label>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-slate-800/60">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button size="sm" onClick={handleSave}>
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}