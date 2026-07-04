export interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  theory: string;
  description: string;
  pythonCode?: string;
  knowledgeRefs?: string[];
  chartType?: "line" | "bar" | "pie" | "area";
  experiment?: {
    type: "slider" | "input" | "table";
    label: string;
    description: string;
    toolId?: "eoq" | "inventory" | "abc" | "cost";
  };
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: Lesson[];
  progress: number;
}

export const modules: Module[] = [
  {
    id: "abc-analysis",
    title: "Phân tích Supply Chain",
    description: "ABC Analysis và phân loại hàng hóa theo giá trị",
    icon: "BarChart3",
    progress: 60,
    lessons: [
      {
        id: "abc-intro",
        title: "Giới thiệu ABC Analysis",
        duration: "15 phút",
        completed: true,
        description: "Hiểu nguyên lý Pareto 80/20 trong quản lý tồn kho",
        theory: `Phân tích ABC (ABC Analysis) là phương pháp phân loại hàng hóa dựa trên nguyên tắc Pareto 80/20. Hàng hóa được chia thành 3 nhóm:

**Nhóm A (10-20% SKU, ~80% giá trị):** Hàng hóa quan trọng nhất, cần kiểm soát chặt chẽ, tần suất đặt hàng cao.

**Nhóm B (20-30% SKU, ~15% giá trị):** Hàng hóa trung bình, áp dụng chính sách quản lý cân bằng.

**Nhóm C (50-70% SKU, ~5% giá trị):** Hàng hóa ít quan trọng, có thể đặt hàng số lượng lớn với tần suất thấp.

Việc phân loại ABC giúp doanh nghiệp tối ưu hóa nguồn lực quản lý tồn kho, tập trung vào các mặt hàng mang lại giá trị cao nhất.`,
        pythonCode: `import pandas as pd
import numpy as np

def abc_analysis(df, value_col='annual_value'):
    """Phân loại ABC dựa trên giá trị hàng năm"""
    df = df.sort_values(value_col, ascending=False).copy()
    df['cumulative_value'] = df[value_col].cumsum()
    df['cumulative_pct'] = df['cumulative_value'] / df[value_col].sum() * 100
    
    def classify(pct):
        if pct <= 80:
            return 'A'
        elif pct <= 95:
            return 'B'
        else:
            return 'C'
    
    df['abc_class'] = df['cumulative_pct'].apply(classify)
    return df

# Dữ liệu mẫu
data = {
    'sku': ['SKU001', 'SKU002', 'SKU003', 'SKU004', 'SKU005'],
    'annual_value': [500000, 300000, 150000, 80000, 50000]
}
df = pd.DataFrame(data)
result = abc_analysis(df)
print(result[['sku', 'annual_value', 'abc_class']])`,
        knowledgeRefs: ["supply-chain-analytics-python"],
        chartType: "pie",
        experiment: {
          type: "table",
          label: "Thử nghiệm phân loại ABC",
          description: "Nhập dữ liệu SKU và xem kết quả phân loại",
          toolId: "abc",
        },
      },
      {
        id: "abc-pareto",
        title: "Biểu đồ Pareto trong ABC",
        duration: "20 phút",
        completed: true,
        description: "Trực quan hóa phân phối giá trị với biểu đồ Pareto",
        theory: `Biểu đồ Pareto kết hợp histogram và đường tích lũy để hiển thị phân phối giá trị. Trục X là các SKU sắp xếp theo giá trị giảm dần, trục Y trái là giá trị tuyệt đối, trục Y phải là phần trăm tích lũy.

Đường 80% trên biểu đồ Pareto là ranh giới phân loại nhóm A. SKU nằm bên trái đường này thuộc nhóm A và cần được ưu tiên quản lý.`,
        pythonCode: `import matplotlib.pyplot as plt

def plot_pareto(df, value_col='annual_value'):
    df_sorted = df.sort_values(value_col, ascending=False)
    cum_pct = df_sorted[value_col].cumsum() / df_sorted[value_col].sum() * 100
    
    fig, ax1 = plt.subplots(figsize=(10, 6))
    ax1.bar(range(len(df_sorted)), df_sorted[value_col], color='#3B82F6')
    ax2 = ax1.twinx()
    ax2.plot(range(len(df_sorted)), cum_pct, color='#EF4444', marker='o')
    ax2.axhline(y=80, color='#22C55E', linestyle='--', label='80% threshold')
    plt.title('Pareto Chart - ABC Analysis')
    plt.show()`,
        knowledgeRefs: ["supply-chain-analytics-python"],
        chartType: "bar",
      },
      {
        id: "abc-policy",
        title: "Chính sách quản lý theo ABC",
        duration: "25 phút",
        completed: false,
        description: "Thiết lập chính sách đặt hàng và kiểm kê theo từng nhóm",
        theory: `Mỗi nhóm ABC yêu cầu chiến lược quản lý khác nhau:

- **Nhóm A:** Kiểm kê hàng tuần, dự báo nhu cầu chính xác, safety stock thấp, nhà cung cấp chiến lược.
- **Nhóm B:** Kiểm kê hàng tháng, EOQ chuẩn, đánh giá nhà cung cấp định kỳ.
- **Nhóm C:** Kiểm kê hàng quý, đặt hàng số lượng lớn, chấp nhận stockout risk cao hơn.

**Nguyên tắc khoa học:** Tần suất kiểm kê tỷ lệ nghịch với ABC class. Chi phí quản lý nhóm A cao nhưng chi phí stockout cũng cao nhất — cần cân bằng theo Total Cost of Ownership (TCO).`,
        knowledgeRefs: ["supply-chain-analytics-python", "awesome-supply-chain"],
        chartType: "area",
      },
    ],
  },
  {
    id: "linear-programming",
    title: "Tối ưu hóa Mạng lưới",
    description: "Linear Programming cho thiết kế mạng lưới phân phối",
    icon: "Network",
    progress: 40,
    lessons: [
      {
        id: "lp-intro",
        title: "Giới thiệu Linear Programming",
        duration: "20 phút",
        completed: true,
        description: "Khái niệm quy hoạch tuyến tính trong logistics",
        theory: `Quy hoạch tuyến tính (Linear Programming - LP) là phương pháp tối ưu hóa với hàm mục tiêu và ràng buộc đều là tuyến tính. Trong Supply Chain, LP được dùng để:

1. **Bài toán vận tải (Transportation Problem):** Phân bổ hàng từ kho đến khách hàng với chi phí tối thiểu.
2. **Thiết kế mạng lưới (Network Design):** Xác định vị trí kho và luồng hàng hóa.
3. **Phân bổ nguồn lực:** Tối ưu hóa sử dụng xe tải, nhân lực kho.`,
        pythonCode: `from scipy.optimize import linprog

# Bài toán vận tải: minimize cost
# Supplies: [100, 150], Demands: [80, 120, 50]
c = [4, 5, 3, 6, 8, 7]  # Chi phí vận chuyển

A_eq = [
    [1, 1, 1, 0, 0, 0],  # Supply 1
    [0, 0, 0, 1, 1, 1],  # Supply 2
    [1, 0, 0, 1, 0, 0],  # Demand 1
    [0, 1, 0, 0, 1, 0],  # Demand 2
    [0, 0, 1, 0, 0, 1],  # Demand 3
]
b_eq = [100, 150, 80, 120, 50]

result = linprog(c, A_eq=A_eq, b_eq=b_eq, method='highs')
print(f"Chi phí tối thiểu: {result.fun}")
print(f"Phương án vận chuyển: {result.x}")`,
        knowledgeRefs: ["python-supply-chain-optimization", "scipy-optimize"],
        chartType: "bar",
      },
      {
        id: "network-design",
        title: "Thiết kế Mạng lưới Phân phối",
        duration: "30 phút",
        completed: false,
        description: "Mô hình hóa và giải bài toán thiết kế mạng lưới",
        theory: `Thiết kế mạng lưới phân phối (Distribution Network Design) xác định số lượng và vị trí các node (nhà máy, kho trung chuyển, kho regional) để minimize tổng chi phí logistics trong khi đáp ứng service level.

Các quyết định chính: Fixed cost (mở kho), Variable cost (vận chuyển), Capacity constraints, Service level requirements.`,
        pythonCode: `import pulp

model = pulp.LpProblem("Network_Design", pulp.LpMinimize)

# Biến quyết định: mở kho hay không
warehouses = ['WH1', 'WH2', 'WH3']
open_wh = pulp.LpVariable.dicts("open", warehouses, cat='Binary')

# Biến luồng hàng
flow = pulp.LpVariable.dicts("flow", 
    [(w, c) for w in warehouses for c in ['C1', 'C2', 'C3']], 
    lowBound=0)

# Hàm mục tiêu
model += pulp.lpSum([50000 * open_wh[w] for w in warehouses]) + \\
         pulp.lpSum([flow[w,c] * 10 for w in warehouses for c in ['C1','C2','C3']])

model.solve()
print(f"Status: {pulp.LpStatus[model.status]}")`,
        knowledgeRefs: ["python-supply-chain-optimization", "google-or-tools"],
        chartType: "line",
      },
    ],
  },
  {
    id: "inventory-management",
    title: "Inventory Management & Simulation",
    description: "EOQ, Safety Stock và mô phỏng tồn kho",
    icon: "Package",
    progress: 25,
    lessons: [
      {
        id: "eoq-model",
        title: "Mô hình EOQ",
        duration: "25 phút",
        completed: true,
        description: "Economic Order Quantity - Số lượng đặt hàng tối ưu",
        theory: `Mô hình EOQ (Economic Order Quantity) xác định số lượng đặt hàng tối ưu để minimize tổng chi phí (ordering cost + holding cost).

**Công thức EOQ:**
EOQ = √(2DS/H)

Trong đó: D = Nhu cầu hàng năm, S = Chi phí đặt hàng mỗi lần, H = Chi phí lưu kho mỗi đơn vị/năm

Tổng chi phí đạt minimum khi ordering cost = holding cost.`,
        pythonCode: `import numpy as np
import matplotlib.pyplot as plt

def eoq_model(D, S, H):
    """Tính EOQ và các chi phí liên quan"""
    eoq = np.sqrt(2 * D * S / H)
    ordering_cost = (D / eoq) * S
    holding_cost = (eoq / 2) * H
    total_cost = ordering_cost + holding_cost
    
    return {
        'EOQ': round(eoq),
        'ordering_cost': round(ordering_cost),
        'holding_cost': round(holding_cost),
        'total_cost': round(total_cost),
        'orders_per_year': round(D / eoq, 1)
    }

# Ví dụ: D=10000, S=50, H=2
result = eoq_model(10000, 50, 2)
print(f"EOQ: {result['EOQ']} units")
print(f"Tổng chi phí: {result['total_cost']:,} VND")`,
        knowledgeRefs: ["supply-chain-analytics-python", "scipy-optimize"],
        chartType: "line",
        experiment: {
          type: "slider",
          label: "Tính EOQ tương tác",
          description: "Điều chỉnh D, S, H và xem biểu đồ chi phí",
          toolId: "eoq",
        },
      },
      {
        id: "safety-stock",
        title: "Safety Stock & Reorder Point",
        duration: "20 phút",
        completed: false,
        description: "Tính toán tồn kho an toàn và điểm đặt hàng lại",
        theory: `Safety Stock (Tồn kho an toàn) bảo vệ chống biến động nhu cầu và lead time. Reorder Point (ROP) là mức tồn kho kích hoạt đặt hàng mới.

**ROP = (Demand × Lead Time) + Safety Stock**
**Safety Stock = Z × σ × √(Lead Time)**

Z là hệ số service level (95% → Z=1.65, 99% → Z=2.33)

**Cơ sở khoa học:** Mô hình giả định nhu cầu và lead time tuân theo phân phối chuẩn. Với service level 95%, chỉ 5% khả năng stockout trong chu kỳ tái đặt hàng.`,
        knowledgeRefs: ["supply-chain-analytics-python"],
        pythonCode: `from scipy import stats

def safety_stock(demand_std, lead_time, service_level=0.95):
    z = stats.norm.ppf(service_level)
    ss = z * demand_std * np.sqrt(lead_time)
    return round(ss)

def reorder_point(avg_demand, lead_time, safety_stock):
    return round(avg_demand * lead_time + safety_stock)`,
        chartType: "area",
      },
      {
        id: "inventory-sim",
        title: "Mô phỏng Tồn kho (Simulation)",
        duration: "35 phút",
        completed: false,
        description: "Monte Carlo simulation cho quản lý tồn kho",
        theory: `Mô phỏng Monte Carlo cho phép mô hình hóa uncertainty trong nhu cầu và lead time. Chạy hàng nghìn scenarios để đánh giá:

- Xác suất stockout
- Mức tồn kho trung bình
- Chi phí tổng thể dưới các điều kiện khác nhau`,
        pythonCode: `import numpy as np

def inventory_simulation(days=365, initial_stock=1000, 
                         reorder_point=200, order_qty=500,
                         demand_mean=50, demand_std=10):
    stock_levels = []
    stock = initial_stock
    
    for day in range(days):
        demand = max(0, np.random.normal(demand_mean, demand_std))
        stock -= demand
        if stock <= reorder_point:
            stock += order_qty
        stock_levels.append(stock)
    
    return stock_levels`,
        knowledgeRefs: ["supply-chain-analytics-python"],
        chartType: "line",
        experiment: {
          type: "slider",
          label: "Mô phỏng tồn kho",
          description: "Chạy simulation với các tham số khác nhau",
          toolId: "inventory",
        },
      },
    ],
  },
  {
    id: "warehouse-logistics",
    title: "Warehouse & Logistics Systems",
    description: "Fleetbase, OpenBoxes và hệ thống WMS/TMS",
    icon: "Warehouse",
    progress: 10,
    lessons: [
      {
        id: "wms-intro",
        title: "Hệ thống Quản lý Kho (WMS)",
        duration: "25 phút",
        completed: false,
        description: "Giới thiệu Warehouse Management System",
        theory: `WMS (Warehouse Management System) quản lý toàn bộ hoạt động trong kho: nhập hàng, lưu trữ, picking, packing, xuất hàng. Các chức năng chính:

- **Slotting optimization:** Sắp xếp vị trí hàng hóa tối ưu
- **Wave planning:** Nhóm đơn hàng để picking hiệu quả
- **Inventory tracking:** Theo dõi real-time
- **Labor management:** Phân công và đo hiệu suất

**Kiến trúc WMS:** Hệ thống 4 lớp — Presentation (UI/API) → Business Logic (rules engine) → Data Access (inventory DB) → Integration (ERP, TMS). Inventory accuracy target ≥99.5% theo chuẩn ngành.`,
        knowledgeRefs: ["openboxes-wms"],
        chartType: "bar",
      },
      {
        id: "fleetbase",
        title: "Fleetbase - Quản lý Vận tải",
        duration: "30 phút",
        completed: false,
        description: "Triển khai TMS với Fleetbase open-source",
        theory: `TMS (Transportation Management System) quản lý toàn bộ hoạt động vận tải trong chuỗi cung ứng.

**Chức năng cốt lõi:**
- **Quản lý đội xe (Fleet Management):** Theo dõi capacity, maintenance schedule, driver assignment
- **Tối ưu tuyến (Route Optimization):** Giải bài toán VRP — Vehicle Routing Problem
- **Tracking real-time:** GPS telematics, ETA prediction, geofencing
- **Freight costing:** Tính chi phí theo km, kg, zone, fuel surcharge

**Cơ sở khoa học:** VRP là bài toán NP-hard. Với n điểm giao, số permutation là n! — cần thuật toán heuristic (savings algorithm, tabu search) hoặc OR-Tools cho bài toán >20 nodes.`,
        knowledgeRefs: ["fleetbase-tms", "google-or-tools"],
        chartType: "line",
      },
      {
        id: "openboxes",
        title: "OpenBoxes - Quản lý Kho Open Source",
        duration: "30 phút",
        completed: false,
        description: "Triển khai OpenBoxes cho quản lý kho",
        theory: `Hệ thống quản lý kho hiện đại cần hỗ trợ multi-location, lot tracking và expiry management.

**Tính năng nâng cao:**
- **Multi-location:** Quản lý tồn kho xuyên suốt nhiều kho, transfer orders
- **Lot/Batch tracking:** Truy xuất nguồn gốc (traceability) — bắt buộc trong pharma, F&B
- **Expiry management:** FEFO (First Expired, First Out) thay vì FIFO thông thường
- **Cold chain:** Giám sát nhiệt độ kho lạnh, alert khi vượt ngưỡng

**Ứng dụng:** Healthcare (vaccine, thuốc), NGO (relief supplies), retail multi-store.`,
        knowledgeRefs: ["openboxes-wms"],
        chartType: "pie",
      },
    ],
  },
  {
    id: "machine-learning",
    title: "Machine Learning trong Supply Chain",
    description: "AI/ML cho dự báo nhu cầu và tối ưu hóa",
    icon: "Brain",
    progress: 0,
    lessons: [
      {
        id: "demand-forecast",
        title: "Dự báo Nhu cầu với ML",
        duration: "35 phút",
        completed: false,
        description: "Time series forecasting với scikit-learn và Prophet",
        theory: `Machine Learning nâng cao độ chính xác dự báo nhu cầu (Demand Forecasting) so với phương pháp truyền thống. Các mô hình phổ biến:

- **ARIMA/SARIMA:** Cho chuỗi thời gian có seasonality
- **Prophet (Facebook):** Xử lý holidays và trend changes
- **XGBoost/LightGBM:** Feature engineering với nhiều biến
- **LSTM:** Deep learning cho pattern phức tạp`,
        pythonCode: `from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import TimeSeriesSplit
import pandas as pd

def create_features(df):
    df['month'] = df['date'].dt.month
    df['quarter'] = df['date'].dt.quarter
    df['lag_1'] = df['demand'].shift(1)
    df['lag_12'] = df['demand'].shift(12)
    df['rolling_mean_3'] = df['demand'].rolling(3).mean()
    return df.dropna()

# Train và predict
model = GradientBoostingRegressor(n_estimators=100)
# model.fit(X_train, y_train)`,
        knowledgeRefs: ["prophet-forecasting", "supply-chain-analytics-python"],
        chartType: "line",
      },
      {
        id: "anomaly-detection",
        title: "Phát hiện Bất thường",
        duration: "30 phút",
        completed: false,
        description: "Anomaly detection trong chuỗi cung ứng",
        theory: `Phát hiện bất thường (Anomaly Detection) giúp identify các sự kiện bất thường trong supply chain: đơn hàng fraud, delay bất thường, spike nhu cầu, quality issues.

**Phương pháp:** Isolation Forest phân ly outlier bằng cách random partitioning — outlier cần ít split hơn để bị cô lập. Contamination parameter (thường 0.01-0.05) xác định tỷ lệ anomaly kỳ vọng.`,
        knowledgeRefs: ["supply-chain-analytics-python"],
        pythonCode: `from sklearn.ensemble import IsolationForest

def detect_anomalies(data, contamination=0.05):
    model = IsolationForest(contamination=contamination, random_state=42)
    predictions = model.fit_predict(data.reshape(-1, 1))
    anomalies = data[predictions == -1]
    return anomalies`,
        chartType: "bar",
      },
    ],
  },
];

export function getModule(moduleId: string): Module | undefined {
  return modules.find((m) => m.id === moduleId);
}

export function getLesson(moduleId: string, lessonId: string): Lesson | undefined {
  const mod = getModule(moduleId);
  return mod?.lessons.find((l) => l.id === lessonId);
}

export function getAllLessons(): Array<Lesson & { moduleId: string; moduleTitle: string }> {
  return modules.flatMap((m) =>
    m.lessons.map((l) => ({
      ...l,
      moduleId: m.id,
      moduleTitle: m.title,
    }))
  );
}