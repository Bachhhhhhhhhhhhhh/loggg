export interface CuratedResource {
  id: string;
  title: string;
  category: string;
  description: string;
  type: "article" | "book" | "course" | "tool" | "dataset";
}

export const curatedResources: CuratedResource[] = [
  {
    id: "scor-model",
    title: "SCOR Model Reference",
    category: "Framework",
    description: "Supply Chain Operations Reference model - chuẩn ngành cho đo lường hiệu suất SC",
    type: "article",
  },
  {
    id: "coyle-book",
    title: "Supply Chain Management: A Logistics Perspective",
    category: "Sách",
    description: "Giáo trình kinh điển về logistics và supply chain management",
    type: "book",
  },
  {
    id: "mit-sc-course",
    title: "MIT Supply Chain Analytics",
    category: "Khóa học",
    description: "Khóa học MIT về phân tích dữ liệu trong supply chain",
    type: "course",
  },
  {
    id: "kaggle-sc",
    title: "Kaggle Supply Chain Datasets",
    category: "Dataset",
    description: "Bộ dữ liệu thực tế về logistics, inventory, demand forecasting",
    type: "dataset",
  },
  {
    id: "anylogistix",
    title: "anyLogistix",
    category: "Công cụ",
    description: "Phần mềm simulation supply chain chuyên nghiệp",
    type: "tool",
  },
];