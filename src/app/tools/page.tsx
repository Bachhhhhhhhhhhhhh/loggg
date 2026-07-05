"use client";

import { Suspense, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Package, BarChart3, DollarSign, Globe } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EOQCalculator } from "@/components/tools/EOQCalculator";
import { InventorySimulator } from "@/components/tools/InventorySimulator";
import { ABCAnalysisTool } from "@/components/tools/ABCAnalysisTool";
import { SupplyChainCostSimulator } from "@/components/tools/SupplyChainCostSimulator";
import { IncotermsAdvisor } from "@/components/tools/IncotermsAdvisor";

const tools = [
  {
    id: "eoq",
    label: "EOQ Calculator",
    description: "Economic Order Quantity — Số lượng đặt hàng tối ưu",
    icon: Calculator,
    color: "#3B82F6",
  },
  {
    id: "inventory",
    label: "Inventory Simulator",
    description: "Mô phỏng tồn kho Monte Carlo 90 ngày",
    icon: Package,
    color: "#14B8A6",
  },
  {
    id: "abc",
    label: "ABC Analysis",
    description: "Phân loại Pareto 80/20 với biểu đồ",
    icon: BarChart3,
    color: "#8B5CF6",
  },
  {
    id: "cost",
    label: "Cost Simulator",
    description: "Phân tích chi phí chuỗi cung ứng",
    icon: DollarSign,
    color: "#F59E0B",
  },
  {
    id: "incoterms",
    label: "Incoterms Advisor",
    description: "Tư vấn 11 điều khoản ICC 2020 + ma trận",
    icon: Globe,
    color: "#0EA5E9",
  },
] as const;

type ToolId = (typeof tools)[number]["id"];

const toolComponents: Record<ToolId, ReactNode> = {
  eoq: <EOQCalculator />,
  inventory: <InventorySimulator />,
  abc: <ABCAnalysisTool />,
  cost: <SupplyChainCostSimulator />,
  incoterms: <IncotermsAdvisor />,
};

function isValidToolId(id: string | null): id is ToolId {
  return tools.some((t) => t.id === id);
}

function ToolsPageContent() {
  const searchParams = useSearchParams();
  const toolParam = searchParams.get("tool");
  const [userTool, setUserTool] = useState<ToolId>("eoq");
  const activeTool = useMemo(
    () => (isValidToolId(toolParam) ? toolParam : userTool),
    [toolParam, userTool]
  );

  const active = tools.find((t) => t.id === activeTool)!;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <PageHeader
        variant="hero"
        eyebrow="Interactive Suite"
        title="Công cụ tương tác"
        subtitle="INTERACTIVE TOOLS — Phân tích & mô phỏng Supply Chain"
        badge="5 TOOLS"
        icon={<Calculator className="h-5 w-5" />}
      />

      <SectionHeader
        eyebrow="Chọn công cụ"
        title="Bộ công cụ SCM"
        description="EOQ, mô phỏng tồn kho, ABC, chi phí chuỗi cung ứng và Incoterms."
        className="mb-2"
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <motion.button
              key={tool.id}
              onClick={() => setUserTool(tool.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "text-left p-4 rounded-xl border transition-all duration-300 card-accent",
                isActive
                  ? "pro-surface border-blue-500/30 bg-blue-500/5 glow-blue"
                  : "pro-surface pro-surface-hover"
              )}
              style={{ "--accent-color": tool.color } as CSSProperties}
            >
              <Icon className="h-5 w-5 mb-2.5" style={{ color: tool.color }} />
              <p className="text-sm font-semibold text-slate-200">{tool.label}</p>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{tool.description}</p>
            </motion.button>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-3">
          <active.icon className="h-4 w-4" style={{ color: active.color }} />
          <CardTitle className="normal-case text-sm">{active.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {toolComponents[activeTool]}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-slate-500">Đang tải công cụ...</div>
      }
    >
      <ToolsPageContent />
    </Suspense>
  );
}