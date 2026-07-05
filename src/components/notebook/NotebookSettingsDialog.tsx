"use client";

import { useState } from "react";
import { Settings, X, Key, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { NotebookSettings } from "@/lib/notebook/types";
import { getSettings, saveSettings } from "@/lib/notebook/storage";
import { testGeminiApi } from "@/lib/notebook/ai";

export function NotebookSettingsDialog() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<NotebookSettings>(getSettings);
  const [testing, setTesting] = useState(false);
  const [testOk, setTestOk] = useState<boolean | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const handleSave = () => {
    saveSettings(settings);
    setOpen(false);
  };

  const handleTest = async () => {
    const key = settings.geminiApiKey.trim();
    if (!key) {
      setTestError("Nhập API key trước khi test");
      setTestOk(false);
      return;
    }
    setTesting(true);
    setTestError(null);
    setTestOk(null);
    try {
      await testGeminiApi(key);
      setTestOk(true);
      setSettings((s) => ({ ...s, useAi: true }));
    } catch (e) {
      setTestOk(false);
      setTestError(e instanceof Error ? e.message : "Kết nối thất bại");
    } finally {
      setTesting(false);
    }
  };

  const hasKey = settings.geminiApiKey.trim().length >= 20;

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setSettings(getSettings());
          setTestOk(null);
          setTestError(null);
          setOpen(true);
        }}
        className="h-8 text-[10px]"
      >
        <Settings className="h-3.5 w-3.5 mr-1" />
        Cài đặt AI
        {hasKey && getSettings().useAi && (
          <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
        )}
      </Button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-400" />
                <h3 className="text-sm font-semibold text-slate-200">Cài đặt Gemini AI</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <Key className="h-3.5 w-3.5" />
                  Gemini API Key
                </label>
                <Input
                  type="password"
                  placeholder="AIzaSy…"
                  value={settings.geminiApiKey}
                  onChange={(e) => {
                    setSettings((s) => ({
                      ...s,
                      geminiApiKey: e.target.value,
                      useAi: e.target.value.trim().length >= 20,
                    }));
                    setTestOk(null);
                    setTestError(null);
                  }}
                  className="bg-slate-950/60 border-slate-800 font-mono text-xs"
                />
                <p className="text-[10px] text-slate-600 mt-1.5">
                  Lấy key tại{" "}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-400 hover:underline"
                  >
                    Google AI Studio
                  </a>
                  . AI dùng Gemini chat đa lượt + retrieval thông minh từ tài liệu.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTest}
                  disabled={testing || !hasKey}
                  className="text-[10px]"
                >
                  {testing ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  Test kết nối
                </Button>
                {testOk === true && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Kết nối OK
                  </span>
                )}
                {testOk === false && (
                  <span className="flex items-center gap-1 text-[10px] text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Lỗi
                  </span>
                )}
              </div>

              {testError && (
                <p className="text-[10px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {testError}
                </p>
              )}

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
                  <p className="text-xs text-slate-300">Bật Gemini AI</p>
                  <p className="text-[10px] text-slate-600">
                    Tự động bật khi có API key hợp lệ
                  </p>
                </div>
                {settings.useAi && hasKey && (
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
                Lưu &amp; dùng AI
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}