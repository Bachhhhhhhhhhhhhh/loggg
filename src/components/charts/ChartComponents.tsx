"use client";

import type { ReactNode } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "#0f172af0",
  border: "1px solid #334155",
  borderRadius: "8px",
  fontSize: "11px",
  color: "#e2e8f0",
  boxShadow: "0 8px 32px #00000040",
  padding: "8px 12px",
};

const axisStyle = { fill: "#64748b", fontSize: 10, fontFamily: "var(--font-jetbrains)" };
const gridStyle = { stroke: "#1e293b", strokeDasharray: "3 3" };

type ChartSeriesInput = object;

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  stroke?: string;
  fill?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle}>
      <p style={{ color: "#94a3b8", fontSize: 10, marginBottom: 6, fontFamily: "monospace" }}>{label}</p>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, marginBottom: 2 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: entry.color || entry.stroke || entry.fill || "#3B82F6",
            }}
          />
          <span style={{ color: "#94a3b8" }}>{entry.name}:</span>
          <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#f1f5f9" }}>
            {typeof entry.value === "number" ? entry.value.toLocaleString("vi-VN") : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

interface DeliveryTrendChartProps {
  data: Array<{ month: string; otd: number; target: number }>;
}

function ChartContainer({ children, height = 220 }: { children: ReactNode; height?: number }) {
  return (
    <div className="w-full" style={{ minHeight: height, height }}>
      {children}
    </div>
  );
}

export function DeliveryTrendChart({ data }: DeliveryTrendChartProps) {
  return (
    <ChartContainer>
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="otdGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridStyle} vertical={false} />
        <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis domain={[85, 100]} tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 10, color: "#64748b", paddingTop: 8 }} />
        <Line
          type="monotone"
          dataKey="otd"
          name="OTD thực tế"
          stroke="#3B82F6"
          strokeWidth={2.5}
          dot={{ fill: "#3B82F6", r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#3B82F6", stroke: "#1e293b", strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="target"
          name="Mục tiêu"
          stroke="#22C55E"
          strokeWidth={1.5}
          strokeDasharray="6 4"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
    </ChartContainer>
  );
}

interface CostBreakdownChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

export function CostBreakdownChart({ data }: CostBreakdownChartProps) {
  return (
    <ChartContainer>
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={82}
          paddingAngle={3}
          dataKey="value"
          stroke="#0f172a"
          strokeWidth={2}
          label={({ name, percent }) =>
            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={{ stroke: "#475569", strokeWidth: 1 }}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Tỷ lệ"]} />
      </PieChart>
    </ResponsiveContainer>
    </ChartContainer>
  );
}

interface InventoryChartProps {
  data: Array<{ week: string; actual: number; optimal: number }>;
}

export function InventoryChart({ data }: InventoryChartProps) {
  return (
    <ChartContainer>
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="optimalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridStyle} vertical={false} />
        <XAxis dataKey="week" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 10, color: "#64748b", paddingTop: 8 }} />
        <Area
          type="monotone"
          dataKey="actual"
          name="Tồn kho thực tế"
          stroke="#3B82F6"
          fill="url(#actualGrad)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="optimal"
          name="Tồn kho tối ưu"
          stroke="#14B8A6"
          fill="url(#optimalGrad)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
      </AreaChart>
    </ResponsiveContainer>
    </ChartContainer>
  );
}

interface GenericBarChartProps {
  data: ChartSeriesInput[];
  xKey: string;
  bars: Array<{ key: string; name: string; color: string }>;
  height?: number;
}

export function GenericBarChart({ data, xKey, bars, height = 220 }: GenericBarChartProps) {
  return (
    <ChartContainer height={height}>
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barGap={2}>
        <CartesianGrid {...gridStyle} vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 10, color: "#64748b", paddingTop: 8 }} />
        {bars.map((bar) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={bar.color}
            radius={[3, 3, 0, 0]}
            maxBarSize={32}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
    </ChartContainer>
  );
}

interface GenericLineChartProps {
  data: ChartSeriesInput[];
  xKey: string;
  lines: Array<{ key: string; name: string; color: string }>;
  height?: number;
}

export function GenericLineChart({ data, xKey, lines, height = 220 }: GenericLineChartProps) {
  return (
    <ChartContainer height={height}>
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid {...gridStyle} vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 10, color: "#64748b", paddingTop: 8 }} />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            dot={{ r: 2, fill: line.color, strokeWidth: 0 }}
            activeDot={{ r: 4, stroke: "#0f172a", strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
    </ChartContainer>
  );
}