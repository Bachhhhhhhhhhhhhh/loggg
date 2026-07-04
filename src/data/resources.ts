export interface GitHubRepo {
  id: string;
  name: string;
  owner: string;
  description: string;
  stars: number;
  language: string;
  topics: string[];
  url: string;
}

export interface CuratedResource {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
  type: "article" | "book" | "course" | "tool" | "dataset";
}

export const githubRepos: GitHubRepo[] = [
  {
    id: "packt-sca",
    name: "Supply-Chain-Analytics-with-Python",
    owner: "PacktPublishing",
    description: "Sách và code mẫu về phân tích chuỗi cung ứng với Python - ABC, EOQ, LP, Simulation",
    stars: 284,
    language: "Python",
    topics: ["supply-chain", "analytics", "python"],
    url: "https://github.com/PacktPublishing/Supply-Chain-Analytics-with-Python",
  },
  {
    id: "juanpablo-sca",
    name: "python-supply-chain-analytics",
    owner: "juanpablorivas",
    description: "Bộ công cụ phân tích SC với Linear Programming, optimization và visualization",
    stars: 412,
    language: "Python",
    topics: ["optimization", "linear-programming", "logistics"],
    url: "https://github.com/juanpablorivas/python-supply-chain-analytics",
  },
  {
    id: "fleetbase",
    name: "fleetbase",
    owner: "fleetbase",
    description: "Nền tảng logistics open-source - TMS, fleet management, route optimization",
    stars: 1850,
    language: "JavaScript",
    topics: ["logistics", "tms", "fleet-management"],
    url: "https://github.com/fleetbase/fleetbase",
  },
  {
    id: "openboxes",
    name: "openboxes",
    owner: "openboxes",
    description: "Hệ thống quản lý kho và inventory open-source cho healthcare và NGO",
    stars: 320,
    language: "Groovy",
    topics: ["wms", "inventory", "healthcare"],
    url: "https://github.com/openboxes/openboxes",
  },
  {
    id: "awesome-sc",
    name: "awesome-supply-chain",
    owner: "supply-chain-tools",
    description: "Danh sách curated các công cụ, thư viện và tài nguyên supply chain",
    stars: 890,
    language: "N/A",
    topics: ["awesome-list", "supply-chain", "resources"],
    url: "https://github.com/supply-chain-tools/awesome-supply-chain",
  },
  {
    id: "or-tools",
    name: "or-tools",
    owner: "google",
    description: "Google OR-Tools - Thư viện optimization cho routing, scheduling, LP/MIP",
    stars: 11200,
    language: "C++",
    topics: ["optimization", "routing", "operations-research"],
    url: "https://github.com/google/or-tools",
  },
  {
    id: "scipy",
    name: "scipy",
    owner: "scipy",
    description: "Thư viện khoa học Python với scipy.optimize cho Linear Programming",
    stars: 13400,
    language: "Python",
    topics: ["scientific-computing", "optimization"],
    url: "https://github.com/scipy/scipy",
  },
  {
    id: "prophet",
    name: "prophet",
    owner: "facebook",
    description: "Facebook Prophet - Dự báo time series cho demand forecasting",
    stars: 19200,
    language: "Python",
    topics: ["forecasting", "time-series", "machine-learning"],
    url: "https://github.com/facebook/prophet",
  },
];

export const curatedResources: CuratedResource[] = [
  {
    id: "scor-model",
    title: "SCOR Model Reference",
    category: "Framework",
    description: "Supply Chain Operations Reference model - chuẩn ngành cho đo lường hiệu suất SC",
    url: "https://www.apics.org/apics-for-business/frameworks/scor",
    type: "article",
  },
  {
    id: "coyle-book",
    title: "Supply Chain Management: A Logistics Perspective",
    category: "Sách",
    description: "Giáo trình kinh điển về logistics và supply chain management",
    url: "https://www.cengage.com/c/supply-chain-management-a-logistics-perspective-11e-coyle",
    type: "book",
  },
  {
    id: "mit-sc-course",
    title: "MIT Supply Chain Analytics",
    category: "Khóa học",
    description: "Khóa học MIT về phân tích dữ liệu trong supply chain",
    url: "https://ocw.mit.edu/courses/engineering-systems-division/",
    type: "course",
  },
  {
    id: "kaggle-sc",
    title: "Kaggle Supply Chain Datasets",
    category: "Dataset",
    description: "Bộ dữ liệu thực tế về logistics, inventory, demand forecasting",
    url: "https://www.kaggle.com/datasets?search=supply+chain",
    type: "dataset",
  },
  {
    id: "anylogistix",
    title: "anyLogistix",
    category: "Công cụ",
    description: "Phần mềm simulation supply chain chuyên nghiệp",
    url: "https://www.anylogistix.com/",
    type: "tool",
  },
];