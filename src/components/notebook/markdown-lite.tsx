import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[\d+\])/g);
  return parts.map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-b-${j}`} className="text-slate-100 font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={`${keyPrefix}-i-${j}`} className="text-slate-400 not-italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (/^\[\d+\]$/.test(part)) {
      return (
        <span
          key={`${keyPrefix}-c-${j}`}
          className="text-teal-400 font-mono text-[11px] mx-0.5"
        >
          {part}
        </span>
      );
    }
    return <span key={`${keyPrefix}-t-${j}`}>{part}</span>;
  });
}

export function renderMarkdownLite(text: string): ReactNode {
  const lines = text.split("\n");
  const nodes: ReactNode[] = [];
  let bulletBuffer: string[] = [];

  const flushBullets = (startIdx: number) => {
    if (!bulletBuffer.length) return;
    nodes.push(
      <ul key={`ul-${startIdx}`} className="my-2 space-y-1.5 list-none pl-0">
        {bulletBuffer.map((b, bi) => (
          <li key={bi} className="flex gap-2 text-slate-300">
            <span className="text-blue-400 shrink-0 mt-0.5">•</span>
            <span>{renderInline(b, `li-${startIdx}-${bi}`)}</span>
          </li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (/^[-•*]\s+/.test(trimmed)) {
      bulletBuffer.push(trimmed.replace(/^[-•*]\s+/, ""));
      return;
    }

    flushBullets(i);

    if (!trimmed) {
      nodes.push(<div key={`br-${i}`} className="h-2" />);
      return;
    }

    if (/^#{1,3}\s+/.test(trimmed)) {
      const content = trimmed.replace(/^#{1,3}\s+/, "");
      nodes.push(
        <h4 key={`h-${i}`} className="text-slate-100 font-semibold mt-3 mb-1.5 text-[13px]">
          {renderInline(content, `h-${i}`)}
        </h4>
      );
      return;
    }

    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      nodes.push(
        <h4 key={`h-${i}`} className="text-slate-100 font-semibold mt-3 mb-1.5 text-[13px]">
          {renderInline(trimmed, `hb-${i}`)}
        </h4>
      );
      return;
    }

    nodes.push(
      <p
        key={`p-${i}`}
        className={cn("text-slate-300 leading-relaxed", i > 0 && "mt-1")}
      >
        {renderInline(trimmed, `p-${i}`)}
      </p>
    );
  });

  flushBullets(lines.length);
  return <>{nodes}</>;
}