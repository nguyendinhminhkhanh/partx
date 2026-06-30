# Công Nghệ Sử Dụng

## Backend (BE)

- **Runtime**: Node.js với CommonJS (`require/module.exports`)
- **Framework**: Express.js v5
- **Database**: MongoDB qua Mongoose v9
- **Xác thực**: JWT (`jsonwebtoken`), mã hoá mật khẩu bằng `bcryptjs`
- **Validation**: Joi
- **Upload file**: Multer + Cloudinary (`multer-storage-cloudinary`)
- **Realtime**: Socket.IO (đã cài, chưa triển khai đầy đủ)
- **Biến môi trường**: `dotenv` — file `.env` nằm trong thư mục `BE/`
- **Dev server**: `nodemon`

## Frontend (FE)

- **Framework**: React 19 + TypeScript
- **Build tool**: Vite 7
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui pattern (components trong `src/components/ui/`)
  - `@radix-ui/react-tooltip` — đã cài, dùng cho `tooltip.tsx`
- **HTTP Client**: Axios — instance cấu hình sẵn tại `src/api/request.tsx`
- **Form**: React Hook Form (dùng `Controller` cho input số tiền)
- **Biểu đồ**: Recharts (`BarChart`, `LineChart` trong trang Home)
- **Toast thông báo**: Sonner
- **Biến môi trường**: `VITE_SERVER_API_URL` trong file `.env` của FE
- **Xuất file**: Không dùng thư viện ngoài — CSV tự tạo Blob, PDF qua `window.print()`

## Các Lệnh Thường Dùng

### Backend
```bash
# Chạy dev server (thư mục BE/)
npm start          # nodemon --inspect index.js
```

### Frontend
```bash
# Chạy dev server (thư mục FE/)
npm run dev        # vite

# Build production
npm run build      # tsc -b && vite build

# Lint
npm run lint       # eslint .

# Preview bản build
npm run preview
```

## Lưu Ý Môi Trường

- BE chạy mặc định tại `http://localhost:3000`
- FE gọi API qua `VITE_SERVER_API_URL`, mặc định fallback về `http://localhost:3000/api`
- Token JWT được lưu trong `localStorage` với key `"token"` và gửi qua header `Authorization`
- `navigator.clipboard` chỉ hoạt động trên HTTPS hoặc `localhost` — khi truy cập qua IP nội bộ (HTTP) cần dùng fallback `document.execCommand("copy")`
