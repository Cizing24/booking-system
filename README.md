# 通用型預約系統

這是一個使用 Next.js、TypeScript、Tailwind CSS、Prisma ORM 與 PostgreSQL 製作的通用型預約網站 MVP。

此專案目前沒有指定產業主題，設計目標是保持乾淨、通用、可擴充。後續可延伸為課程預約、美容預約、諮詢預約、診所預約、活動報名等系統。

---

## 目前版本

第一版 MVP。

---

## 功能清單

### 使用者端

使用者可以：

* 查看首頁
* 查看啟用中的服務項目
* 選擇服務
* 選擇日期
* 選擇時段
* 填寫姓名、電話、Email、備註
* 建立預約
* 查看預約成功頁
* 使用 Email 或電話查詢預約紀錄

### 管理者端

管理者可以：

* 使用 Email 和密碼登入後台
* 登出後台
* 查看所有預約
* 查看單筆預約詳細資料
* 修改預約狀態
* 查看所有服務項目
* 新增服務
* 編輯服務名稱、說明、時長、價格
* 啟用服務
* 停用服務

---

## 核心規則

目前已實作：

* 同一服務、同一日期、同一時段不可重複預約
* 預約日期不可早於今天
* 停用服務不會出現在使用者端
* 停用服務不可被預約
* 取消的預約不再佔用該時段
* 未登入者不能進入管理者後台
* 管理者 API 需要登入後才能操作
* 管理員密碼使用 hash 儲存，不儲存明文密碼

---

## 預約狀態

預約狀態包含：

* `pending`：待確認
* `confirmed`：已確認
* `cancelled`：已取消

---

## 技術棧

* Next.js
* TypeScript
* Tailwind CSS
* PostgreSQL / Supabase
* Prisma ORM
* bcryptjs
* Vercel

---

## 專案結構

```txt
booking-system/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
│
├─ public/
│
├─ src/
│  ├─ app/
│  │  ├─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ globals.css
│  │  │
│  │  ├─ services/
│  │  │  └─ page.tsx
│  │  │
│  │  ├─ booking/
│  │  │  ├─ page.tsx
│  │  │  ├─ success/
│  │  │  │  └─ page.tsx
│  │  │  └─ search/
│  │  │     └─ page.tsx
│  │  │
│  │  ├─ admin/
│  │  │  ├─ login/
│  │  │  │  └─ page.tsx
│  │  │  ├─ bookings/
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ [id]/
│  │  │  │     └─ page.tsx
│  │  │  └─ services/
│  │  │     └─ page.tsx
│  │  │
│  │  └─ api/
│  │     ├─ services/
│  │     ├─ bookings/
│  │     └─ admin/
│  │
│  ├─ components/
│  │  ├─ ui/
│  │  ├─ AdminLoginForm.tsx
│  │  ├─ AdminNav.tsx
│  │  ├─ AdminServiceForm.tsx
│  │  ├─ AdminServiceEditForm.tsx
│  │  ├─ BookingForm.tsx
│  │  ├─ BookingSearchForm.tsx
│  │  ├─ BookingStatusForm.tsx
│  │  ├─ PageHeader.tsx
│  │  └─ ServiceStatusButton.tsx
│  │
│  ├─ generated/
│  │  └─ prisma/
│  │
│  └─ lib/
│     ├─ admin-page-auth.ts
│     ├─ auth.ts
│     ├─ booking-status.ts
│     ├─ booking-time.ts
│     ├─ cn.ts
│     ├─ date.ts
│     ├─ format.ts
│     ├─ password.ts
│     ├─ prisma.ts
│     └─ response.ts
│
├─ .env
├─ .env.example
├─ package.json
├─ prisma.config.ts
└─ README.md
```

---

## 環境變數

請建立 `.env`：

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123456"
ADMIN_SESSION_SECRET="replace-with-a-long-random-secret"

APP_TIME_ZONE="Asia/Taipei"
```

### 說明

| 變數                     | 用途                         |
| ---------------------- | -------------------------- |
| `DATABASE_URL`         | PostgreSQL / Supabase 連線字串 |
| `ADMIN_EMAIL`          | seed 時建立的管理員 Email         |
| `ADMIN_PASSWORD`       | seed 時建立的管理員密碼             |
| `ADMIN_SESSION_SECRET` | 管理員登入 session 簽章密鑰         |
| `APP_TIME_ZONE`        | 系統日期時間使用時區                 |

### 注意

請不要把 `.env` 上傳到 GitHub。

---

## 安裝專案

```bash
pnpm install
```

---

## 產生 Prisma Client

```bash
pnpm exec prisma generate
```

---

## 建立資料表

```bash
pnpm exec prisma migrate dev --name init
```

---

## 建立測試資料

```bash
pnpm exec prisma db seed
```

seed 會建立：

* 管理員帳號
* 啟用服務
* 停用測試服務

---

## 開啟 Prisma Studio

```bash
pnpm exec prisma studio
```

---

## 啟動開發伺服器

```bash
pnpm dev
```

開啟：

```txt
http://localhost:3000
```

---

## 常用網址

### 使用者端

| 頁面   | 路徑                 |
| ---- | ------------------ |
| 首頁   | `/`                |
| 服務列表 | `/services`        |
| 建立預約 | `/booking`         |
| 預約成功 | `/booking/success` |
| 預約查詢 | `/booking/search`  |

### 管理者端

| 頁面    | 路徑                     |
| ----- | ---------------------- |
| 管理員登入 | `/admin/login`         |
| 預約管理  | `/admin/bookings`      |
| 預約詳細  | `/admin/bookings/[id]` |
| 服務管理  | `/admin/services`      |

---

## 管理員測試帳號

預設 seed 會依照 `.env` 建立管理員帳號。

範例：

```txt
Email: admin@example.com
Password: admin123456
```

如果你修改過 `.env` 的 `ADMIN_EMAIL` 或 `ADMIN_PASSWORD`，請使用你自己的設定。

---

## 測試流程

### 使用者端測試

1. 進入 `/services`
2. 確認只顯示啟用中的服務
3. 點擊「預約此服務」
4. 填寫預約表單
5. 建立預約
6. 確認導向 `/booking/success?bookingId=...`
7. 使用 `/booking/search` 查詢預約

### 重複預約測試

1. 建立一筆預約
2. 使用同一服務、同一日期、同一時段再次預約
3. 系統應拒絕建立預約

### 取消預約釋放時段測試

1. 登入後台
2. 進入預約詳細頁
3. 將預約狀態改為 `cancelled`
4. 回到使用者端建立同一服務、同一日期、同一時段的預約
5. 系統應允許建立新預約

### 管理者端測試

1. 未登入時進入 `/admin/bookings`
2. 系統應導向 `/admin/login`
3. 使用管理員帳號登入
4. 查看所有預約
5. 查看預約詳細資料
6. 修改預約狀態
7. 新增服務
8. 編輯服務
9. 停用服務
10. 啟用服務
11. 登出後台

---

## Build 檢查

```bash
pnpm build
```

如果 build 成功，代表專案可以準備部署。

---

## 部署前檢查清單

部署前請確認：

* `.env.example` 已整理完成
* `.env` 沒有被提交到 GitHub
* `DATABASE_URL` 使用正式資料庫連線字串
* `ADMIN_SESSION_SECRET` 已換成隨機長字串
* `ADMIN_PASSWORD` 已換成安全密碼
* `pnpm build` 成功
* Supabase 資料表已建立
* seed 已執行
* 管理員帳號可以登入
* 使用者可以建立預約
* 後台可以查看與管理預約
* 後台可以管理服務

---

## 第一版暫不實作

以下功能不包含在第一版 MVP：

* 金流付款
* Email 自動通知
* LINE 通知
* Google Calendar 同步
* 多店家系統
* 多員工排班
* 會員系統
* 複雜報表
* 主題化內容

---

## 後續可擴充功能

第二版可考慮加入：

* Email 預約通知
* LINE 預約通知
* Google Calendar 同步
* 可設定營業時間
* 可設定休假日
* 可設定每個服務可預約時段
* 管理者刪除服務
* 預約取消原因
* 預約備註管理
* 報表統計
* 多管理員帳號
* 角色權限
* 主題化 UI
