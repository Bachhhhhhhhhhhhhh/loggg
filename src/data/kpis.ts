export interface KPI {
  id: string;
  label: string;
  value: string;
  change: number;
  unit?: string;
  trend: "up" | "down" | "neutral";
  description: string;
  sparkline?: number[];
}

export const dashboardKPIs: KPI[] = [
  {
    id: "otd",
    label: "Tỷ lệ giao hàng đúng hạn",
    value: "94.2",
    change: 2.3,
    unit: "%",
    trend: "up",
    description: "On-time Delivery Rate trung bình ngành",
    sparkline: [91.2, 92.5, 93.1, 92.8, 93.9, 94.2],
  },
  {
    id: "cost",
    label: "Tiềm năng giảm chi phí",
    value: "18.5",
    change: 4.1,
    unit: "%",
    trend: "up",
    description: "Total Cost Reduction Potential",
    sparkline: [12, 14, 15, 16, 17, 18.5],
  },
  {
    id: "inventory",
    label: "Hiệu quả tồn kho",
    value: "87.3",
    change: -1.2,
    unit: "%",
    trend: "down",
    description: "Inventory Turnover Efficiency",
    sparkline: [90, 89, 88.5, 88, 87.8, 87.3],
  },
  {
    id: "fill",
    label: "Tỷ lệ đáp ứng đơn hàng",
    value: "96.8",
    change: 0.8,
    unit: "%",
    trend: "up",
    description: "Order Fill Rate",
    sparkline: [95.2, 95.8, 96, 96.2, 96.5, 96.8],
  },
  {
    id: "lead",
    label: "Lead Time trung bình",
    value: "4.2",
    change: -0.5,
    unit: "ngày",
    trend: "up",
    description: "Thời gian từ đặt hàng đến giao hàng",
    sparkline: [5.1, 4.9, 4.7, 4.5, 4.3, 4.2],
  },
  {
    id: "carbon",
    label: "Carbon Footprint",
    value: "2.14",
    change: -3.2,
    unit: "tCO₂",
    trend: "up",
    description: "Phát thải logistics trên đơn vị vận chuyển",
    sparkline: [2.5, 2.4, 2.35, 2.28, 2.2, 2.14],
  },
];

export interface TickerItem {
  symbol: string;
  name: string;
  value: string;
  change: number;
  unit?: string;
}

export const tickerData: TickerItem[] = [
  { symbol: "OTD", name: "On-time Delivery", value: "94.2", change: 2.3, unit: "%" },
  { symbol: "INV", name: "Inventory Turnover", value: "8.7", change: -0.4, unit: "x" },
  { symbol: "FILL", name: "Order Fill Rate", value: "96.8", change: 0.8, unit: "%" },
  { symbol: "COST", name: "Logistics Cost Ratio", value: "12.4", change: -1.2, unit: "%" },
  { symbol: "LEAD", name: "Avg Lead Time", value: "4.2", change: -0.5, unit: "d" },
  { symbol: "OTIF", name: "OTIF Rate", value: "91.5", change: 1.8, unit: "%" },
  { symbol: "DSO", name: "Days Sales Outstanding", value: "32", change: -2, unit: "d" },
  { symbol: "CO2", name: "Carbon/Unit", value: "2.14", change: -3.2, unit: "t" },
  { symbol: "WMS", name: "Warehouse Utilization", value: "78.3", change: 3.1, unit: "%" },
  { symbol: "OTD", name: "On-time Delivery", value: "94.2", change: 2.3, unit: "%" },
  { symbol: "INV", name: "Inventory Turnover", value: "8.7", change: -0.4, unit: "x" },
  { symbol: "FILL", name: "Order Fill Rate", value: "96.8", change: 0.8, unit: "%" },
];

export interface MarketWatchItem {
  id: string;
  metric: string;
  category: string;
  current: number;
  previous: number;
  target: number;
  unit: string;
  status: "good" | "warning" | "critical";
}

export const marketWatchData: MarketWatchItem[] = [
  { id: "1", metric: "On-time Delivery (OTD)", category: "Fulfillment", current: 94.2, previous: 91.9, target: 95, unit: "%", status: "good" },
  { id: "2", metric: "Perfect Order Rate", category: "Fulfillment", current: 89.1, previous: 87.5, target: 92, unit: "%", status: "warning" },
  { id: "3", metric: "Inventory Turnover", category: "Inventory", current: 8.7, previous: 9.1, target: 10, unit: "x", status: "warning" },
  { id: "4", metric: "Days of Supply", category: "Inventory", current: 42, previous: 45, target: 35, unit: "ngày", status: "warning" },
  { id: "5", metric: "Freight Cost / Unit", category: "Transport", current: 12500, previous: 13200, target: 11000, unit: "VND", status: "good" },
  { id: "6", metric: "Warehouse Utilization", category: "Warehouse", current: 78.3, previous: 75.2, target: 85, unit: "%", status: "good" },
  { id: "7", metric: "Stockout Rate", category: "Inventory", current: 2.1, previous: 3.4, target: 1.5, unit: "%", status: "warning" },
  { id: "8", metric: "Supplier OTIF", category: "Procurement", current: 91.5, previous: 89.8, target: 95, unit: "%", status: "good" },
  { id: "9", metric: "Cash-to-Cash Cycle", category: "Finance", current: 45, previous: 48, target: 40, unit: "ngày", status: "warning" },
  { id: "10", metric: "Return Rate", category: "Fulfillment", current: 1.8, previous: 2.1, target: 1.5, unit: "%", status: "good" },
];

export const chartData = {
  deliveryTrend: [
    { month: "T1", otd: 91.2, target: 95 },
    { month: "T2", otd: 92.5, target: 95 },
    { month: "T3", otd: 93.1, target: 95 },
    { month: "T4", otd: 92.8, target: 95 },
    { month: "T5", otd: 93.9, target: 95 },
    { month: "T6", otd: 94.2, target: 95 },
  ],
  costBreakdown: [
    { name: "Vận chuyển", value: 35, color: "#3B82F6" },
    { name: "Kho bãi", value: 25, color: "#14B8A6" },
    { name: "Tồn kho", value: 20, color: "#8B5CF6" },
    { name: "Xử lý đơn", value: 12, color: "#F59E0B" },
    { name: "Khác", value: 8, color: "#6B7280" },
  ],
  inventoryLevels: [
    { week: "W1", actual: 4500, optimal: 4200 },
    { week: "W2", actual: 4800, optimal: 4200 },
    { week: "W3", actual: 4100, optimal: 4200 },
    { week: "W4", actual: 3900, optimal: 4200 },
    { week: "W5", actual: 4300, optimal: 4200 },
    { week: "W6", actual: 4200, optimal: 4200 },
  ],
  weeklyActivity: [
    { day: "T2", lessons: 3, tools: 2 },
    { day: "T3", lessons: 5, tools: 1 },
    { day: "T4", lessons: 2, tools: 4 },
    { day: "T5", lessons: 4, tools: 3 },
    { day: "T6", lessons: 6, tools: 2 },
    { day: "T7", lessons: 1, tools: 1 },
    { day: "CN", lessons: 2, tools: 0 },
  ],
};