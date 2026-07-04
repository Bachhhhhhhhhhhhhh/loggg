"use client";

import { useState, useMemo } from "react";
import { Copy, Check, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  code: string;
  language?: string;
}

const PYTHON_KEYWORDS = new Set([
  "import", "from", "def", "return", "if", "else", "elif", "for", "in",
  "while", "class", "try", "except", "with", "as", "and", "or", "not",
  "True", "False", "None", "print", "lambda", "yield", "pass", "break",
]);

function highlightPython(code: string): React.ReactNode[] {
  const lines = code.split("\n");
  return lines.map((line, lineIdx) => {
    if (line.trim().startsWith("#")) {
      return (
        <span key={lineIdx}>
          <span className="code-comment">{line}</span>
          {lineIdx < lines.length - 1 ? "\n" : ""}
        </span>
      );
    }

    const tokens = line.split(/(\b(?:import|from|def|return|if|else|elif|for|in|while|class|try|except|with|as|and|or|not|True|False|None|print|lambda)\b|'[^']*'|"[^"]*"|\d+\.?\d*)/g);

    return (
      <span key={lineIdx}>
        {tokens.map((token, i) => {
          if (!token) return null;
          if (PYTHON_KEYWORDS.has(token)) {
            return <span key={i} className="code-keyword">{token}</span>;
          }
          if (/^['"]/.test(token)) {
            return <span key={i} className="code-string">{token}</span>;
          }
          if (/^\d/.test(token)) {
            return <span key={i} className="code-number">{token}</span>;
          }
          if (token.endsWith("(") || (i > 0 && tokens[i - 1] === "def")) {
            return <span key={i} className="code-function">{token}</span>;
          }
          return <span key={i}>{token}</span>;
        })}
        {lineIdx < lines.length - 1 ? "\n" : ""}
      </span>
    );
  });
}

export function CodeBlock({ code, language = "python" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const highlighted = useMemo(() => highlightPython(code), [code]);
  const lineCount = code.split("\n").length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-xl border border-slate-800/60 overflow-hidden shadow-lg shadow-black/20">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-teal-400" />
          <span className="text-[11px] text-slate-400 font-mono ml-2">{language}</span>
          <span className="text-[10px] text-slate-600 ml-2">{lineCount} lines</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2.5 text-[11px]">
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Đã copy</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="flex">
        <div className="py-4 pl-3 pr-2 text-right select-none border-r border-slate-800/40 bg-slate-950/50">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="text-[10px] text-slate-700 font-mono leading-relaxed">
              {i + 1}
            </div>
          ))}
        </div>
        <pre className="flex-1 p-4 overflow-x-auto text-[12px] leading-relaxed bg-slate-950/80">
          <code className="text-slate-300 font-mono">{highlighted}</code>
        </pre>
      </div>
    </div>
  );
}