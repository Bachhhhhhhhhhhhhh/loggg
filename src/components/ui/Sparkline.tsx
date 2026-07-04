"use client";

import { useId, useMemo } from "react";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  positive?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 80,
  height = 28,
  color,
  positive = true,
  className,
}: SparklineProps) {
  const fillId = useId().replace(/:/g, "");

  const path = useMemo(() => {
    if (data.length < 2) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;

    const points = data.map((v, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
  }, [data, width, height]);

  if (data.length < 2 || !path) {
    return <div className={cn("opacity-30", className)} style={{ width, height }} />;
  }

  const strokeColor = color ?? (positive ? "#22c55e" : "#ef4444");

  return (
    <svg width={width} height={height} className={cn("overflow-visible", className)}>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={`${path} L ${width - 2},${height} L 2,${height} Z`}
        fill={`url(#${fillId})`}
      />
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}