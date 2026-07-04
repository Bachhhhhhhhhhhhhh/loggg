# LogIQ

Nền tảng học **Logistics & Supply Chain Management** — thiết kế theo phong cách dashboard phân tích chuyên nghiệp.

**Tác giả:** Brian Bach Truong  
**Tagline:** Học Logistics & Supply Chain một cách chuyên nghiệp và thực tiễn

## Yêu cầu

- **Node.js 18+** (khuyến nghị 20 LTS): https://nodejs.org

## Chạy dự án (Windows)

### Cách 1 — Script tự động (khuyến nghị)

```powershell
cd C:\Users\user\logiq
.\start.ps1
```

### Cách 2 — Thủ công

```powershell
cd C:\Users\user\logiq
npm install
npm run dev
```

Mở trình duyệt: **http://localhost:3000**

> Nếu port 3000 bị chiếm, dừng server cũ:
> `taskkill /F /IM node.exe` rồi chạy lại `npm run dev`

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
- Dark theme kiểu nền tảng chứng khoán