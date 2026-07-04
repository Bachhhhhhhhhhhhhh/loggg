# LogIQ

Nền tảng học **Logistics & Supply Chain Management** — thiết kế theo phong cách dashboard phân tích chuyên nghiệp.

**Tác giả:** Brian Bach Truong  
**Tagline:** Học Logistics & Supply Chain một cách chuyên nghiệp và thực tiễn

## Yêu cầu

- **Node.js 18+** (khuyến nghị 20 LTS): https://nodejs.org

## Chạy dự án (Windows)

### Cách 1 — Double-click (dễ nhất)

Double-click file **`start.bat`** trong thư mục dự án.

### Cách 2 — PowerShell

```powershell
cd C:\Users\user\logiq
.\start.ps1
```

### Cách 3 — Thủ công

```powershell
cd C:\Users\user\logiq
npm install
npm run dev
```

Mở trình duyệt: **http://localhost:3000**

### Lỗi thường gặp

| Lỗi | Cách sửa |
|-----|----------|
| `EADDRINUSE port 3000` | Chạy `npm run dev:stop` hoặc `start.bat` (tự dừng port cũ) |
| Trang trắng / không load | Đảm bảo đã chạy `npm install` |
| `Another next dev server` | Chạy `start.bat` — script tự xóa lock file |

## Build production

```powershell
npm run build
npm start
```

## Công nghệ

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + Recharts + Framer Motion

## Tính năng

- Dashboard KPI + biểu đồ tương tác
- 5 module học tập với code Python
- Công cụ: EOQ, Inventory Simulator, ABC Analysis, Cost Simulator
- Lộ trình học 5 giai đoạn
- **Thư viện tri thức** — 8 chủ đề khoa học tích hợp (ABC, EOQ, LP, WMS, TMS, OR-Tools, Prophet, SCOR)
- Dark theme kiểu nền tảng chứng khoán

## Xem web trên máy bạn

GitHub chỉ lưu **mã nguồn**, không tự chạy website. Để xem giao diện LogIQ:

```powershell
cd C:\Users\user\logiq
.\start.bat
```

Mở **http://localhost:3000** → menu **Tri thức** (`/resources`)

## Cấu trúc tri thức tích hợp

| File | Mô tả |
|------|--------|
| `src/data/knowledge-base.ts` | 8 chủ đề: lý thuyết, công thức, code Python |
| `src/app/resources/` | Thư viện tri thức + trang chi tiết từng chủ đề |
| `src/data/modules.ts` | Bài học liên kết nội bộ qua `knowledgeRefs` |

## Repo

https://github.com/Bachhhhhhhhhhhhhh/loggg