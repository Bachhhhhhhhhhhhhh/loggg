"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { GenericBarChart } from "@/components/charts/ChartComponents";
import { Plus, Trash2 } from "lucide-react";

interface SKUItem {
  sku: string;
  annual_value: number;
  abc_class?: string;
  cumulative_pct?: number;
}

const defaultData: SKUItem[] = [
  { sku: "SKU-001", annual_value: 500000 },
  { sku: "SKU-002", annual_value: 300000 },
  { sku: "SKU-003", annual_value: 150000 },
  { sku: "SKU-004", annual_value: 80000 },
  { sku: "SKU-005", annual_value: 50000 },
  { sku: "SKU-006", annual_value: 35000 },
  { sku: "SKU-007", annual_value: 20000 },
  { sku: "SKU-008", annual_value: 15000 },
];

function classifyABC(items: SKUItem[]): SKUItem[] {
  const sorted = [...items].sort((a, b) => b.annual_value - a.annual_value);
  const total = sorted.reduce((s, i) => s + i.annual_value, 0);
  let cumulative = 0;

  return sorted.map((item) => {
    cumulative += item.annual_value;
    const pct = (cumulative / total) * 100;
    let abc_class = "C";
    if (pct <= 80) abc_class = "A";
    else if (pct <= 95) abc_class = "B";
    return { ...item, cumulative_pct: Math.round(pct * 10) / 10, abc_class };
  });
}

export function ABCAnalysisTool() {
  const [items, setItems] = useState<SKUItem[]>(defaultData);
  const [newSku, setNewSku] = useState("");
  const [newValue, setNewValue] = useState("");

  const classified = useMemo(() => classifyABC(items), [items]);

  const chartData = classified.map((i) => ({
    sku: i.sku,
    value: i.annual_value,
  }));

  const classColors: Record<string, string> = { A: "#3B82F6", B: "#14B8A6", C: "#6B7280" };

  const summary = useMemo(() => {
    const groups = { A: 0, B: 0, C: 0 };
    classified.forEach((i) => {
      if (i.abc_class) groups[i.abc_class as keyof typeof groups]++;
    });
    return groups;
  }, [classified]);

  const columns: Column<SKUItem>[] = [
    { key: "sku", header: "SKU", sortable: true },
    {
      key: "annual_value",
      header: "Giá trị hàng năm",
      sortable: true,
      render: (r) => <span className="font-mono">{r.annual_value.toLocaleString("vi-VN")}</span>,
    },
    {
      key: "cumulative_pct",
      header: "% Tích lũy",
      sortable: true,
      render: (r) => <span className="font-mono">{r.cumulative_pct}%</span>,
    },
    {
      key: "abc_class",
      header: "Phân loại",
      sortable: true,
      render: (r) => (
        <Badge variant={r.abc_class === "A" ? "default" : r.abc_class === "B" ? "teal" : "secondary"}>
          Nhóm {r.abc_class}
        </Badge>
      ),
    },
  ];

  const addItem = () => {
    if (newSku && newValue) {
      setItems([...items, { sku: newSku, annual_value: Number(newValue) }]);
      setNewSku("");
      setNewValue("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {(["A", "B", "C"] as const).map((cls) => (
          <Card key={cls} className="border-l-2" style={{ borderLeftColor: classColors[cls] }}>
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase">Nhóm {cls}</p>
              <p className="text-2xl font-bold" style={{ color: classColors[cls] }}>{summary[cls]}</p>
              <p className="text-[10px] text-slate-500">SKU</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-xs text-slate-400 mb-1 block">Mã SKU</label>
          <Input value={newSku} onChange={(e) => setNewSku(e.target.value)} placeholder="SKU-009" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-slate-400 mb-1 block">Giá trị hàng năm</label>
          <Input type="number" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="100000" />
        </div>
        <Button onClick={addItem} size="sm"><Plus className="h-4 w-4" /> Thêm</Button>
        <Button variant="danger" size="sm" onClick={() => setItems(defaultData)}>
          <Trash2 className="h-4 w-4" /> Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Biểu đồ Pareto</CardTitle></CardHeader>
          <CardContent>
            <GenericBarChart
              data={chartData}
              xKey="sku"
              bars={[{ key: "value", name: "Giá trị (VND)", color: "#3B82F6" }]}
              height={280}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Bảng phân loại ABC</CardTitle></CardHeader>
          <CardContent>
            <DataTable data={classified} columns={columns} maxHeight="280px" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}