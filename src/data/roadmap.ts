export interface Phase {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  lessons: number;
  duration: string;
  progress: number;
  skills: string[];
  color: string;
}

export const phases: Phase[] = [
  {
    id: "foundation",
    number: 1,
    title: "Nền tảng Supply Chain",
    subtitle: "Phân tích & Đo lường",
    description:
      "Nắm vững các khái niệm cốt lõi về chuỗi cung ứng, phân tích ABC, và các chỉ số KPI quan trọng.",
    lessons: 8,
    duration: "2 tuần",
    progress: 75,
    skills: ["ABC Analysis", "KPI Dashboard", "Demand Forecasting"],
    color: "#3B82F6",
  },
  {
    id: "optimization",
    number: 2,
    title: "Tối ưu hóa Mạng lưới",
    subtitle: "Linear Programming",
    description:
      "Áp dụng quy hoạch tuyến tính (Linear Programming) để tối ưu hóa mạng lưới phân phối và vận chuyển.",
    lessons: 10,
    duration: "3 tuần",
    progress: 45,
    skills: ["LP Modeling", "Network Design", "Transportation Problem"],
    color: "#14B8A6",
  },
  {
    id: "inventory",
    number: 3,
    title: "Quản lý Tồn kho",
    subtitle: "Simulation & EOQ",
    description:
      "Học các mô hình EOQ, mô phỏng tồn kho (Inventory Simulation) và chiến lược quản lý stock.",
    lessons: 12,
    duration: "3 tuần",
    progress: 30,
    skills: ["EOQ Model", "Safety Stock", "Monte Carlo Simulation"],
    color: "#8B5CF6",
  },
  {
    id: "warehouse",
    number: 4,
    title: "Kho bãi & Logistics",
    subtitle: "Fleetbase & OpenBoxes",
    description:
      "Triển khai hệ thống quản lý kho và vận tải với Fleetbase và OpenBoxes.",
    lessons: 9,
    duration: "2.5 tuần",
    progress: 15,
    skills: ["WMS", "TMS", "Route Optimization"],
    color: "#F59E0B",
  },
  {
    id: "ml",
    number: 5,
    title: "Machine Learning",
    subtitle: "AI trong Supply Chain",
    description:
      "Ứng dụng Machine Learning cho dự báo nhu cầu, phát hiện bất thường và tối ưu hóa tự động.",
    lessons: 11,
    duration: "4 tuần",
    progress: 0,
    skills: ["Demand Forecasting", "Anomaly Detection", "Optimization ML"],
    color: "#EF4444",
  },
  {
    id: "trade",
    number: 6,
    title: "Thương mại Quốc tế",
    subtitle: "Incoterms® 2020",
    description:
      "Nắm vững 11 điều khoản ICC: rủi ro, chi phí, bảo hiểm, chứng từ và chọn điều khoản phù hợp cho xuất nhập khẩu.",
    lessons: 8,
    duration: "2 tuần",
    progress: 0,
    skills: ["Incoterms 2020", "FOB/CIF/DDP", "Risk Transfer", "Trade Documents"],
    color: "#0EA5E9",
  },
];