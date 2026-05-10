# Cấu Trúc Dự Án

Dự án chia thành 2 thư mục độc lập: `BE/` (backend) và `FE/` (frontend).

---

## Backend — `BE/`

```
BE/
├── index.js                  # Entry point: kết nối MongoDB, đăng ký routes, khởi động server
├── .env                      # Biến môi trường (MONGODB_URI, PRIVATE_KEY, EXPIRE_TIME, ...)
├── API.md                    # Tài liệu toàn bộ API endpoints để test Postman
├── common/
│   ├── httpError.js          # Class HttpError(message, status) — dùng để throw lỗi có HTTP status
│   ├── errorHandle.js        # Express error middleware — bắt mọi lỗi, trả về { success: 0, message }
│   ├── tokenProvider.js      # Wrapper JWT: sign(userId) và verify(token)
│   └── middlewares/
│       ├── isAuth.js         # Xác thực token, gắn req.user — dùng cho route yêu cầu đăng nhập
│       ├── getUser.js        # Lấy user từ token (không bắt buộc đăng nhập)
│       └── validateInput.js  # Validate request body/query bằng Joi schema
└── modules/
    ├── auth/                 # Đăng ký, đăng nhập, lấy thông tin, cập nhật hồ sơ, đổi mật khẩu
    ├── invoice/              # CRUD hóa đơn bán hàng
    ├── salesUnit/            # CRUD đơn vị bán hàng
    ├── upload/               # Upload/xóa ảnh trên Cloudinary
    └── comment/              # (Chưa triển khai)
```

### Quy Tắc Module Backend

Mỗi module trong `modules/` gồm 4 file theo chuẩn:
- `<tên>.js` — Mongoose Schema & Model
- `<tên>.controller.js` — Các hàm xử lý request (async, throw HttpError khi lỗi)
- `<tên>.router.js` — Định nghĩa routes Express, gắn middleware
- `index.js` — Export router để `index.js` gốc import

**Quy tắc xử lý lỗi BE:**
- Dùng `throw new HttpError(message, statusCode)` trong controller — Express 5 tự bắt async error
- Middleware `errorHandle.js` trả về format chuẩn: `{ success: 0, data: null, message }`
- Response thành công luôn có dạng: `{ success: 1, data: ... }`

**Auth header:** Token JWT gửi qua `Authorization: <token>` — không có prefix `Bearer`

---

## Frontend — `FE/`

```
FE/src/
├── App.tsx                   # Root component: AuthContext provider, định nghĩa toàn bộ routes
├── main.tsx                  # Entry point React
├── index.css                 # Global styles (Tailwind)
├── api/
│   ├── request.tsx           # Axios instance + wrapper function trả về Promise<any> (đã unwrap res.data)
│   └── axios.d.ts            # Module augmentation — fix TypeScript type cho axios interceptor
├── hook/
│   └── useAuth.tsx           # AuthContext + useAuth() hook — lấy thông tin user đang đăng nhập
├── lib/
│   └── utils.ts              # Hàm tiện ích (cn() cho Tailwind class merging)
├── components/
│   ├── ui/                   # shadcn/ui components (Button, Input, Dialog, Table, ...)
│   ├── Layout/               # MainLayout wrapper
│   ├── Navbar/               # Thanh điều hướng (desktop + mobile, hiển thị avatar từ AuthContext)
│   ├── ActionMenu/           # Menu hành động (edit/delete)
│   └── CreateInvoiceDialog/  # Dialog tạo hóa đơn
└── pages/
    ├── Login/                # Đăng nhập
    ├── Register/             # Đăng ký
    ├── Home/                 # Trang chủ
    ├── Profile/              # Hồ sơ cá nhân (đổi avatar, cập nhật thông tin, đổi mật khẩu)
    ├── InvoiceList/          # Danh sách hóa đơn
    ├── CreateInvoice/        # Tạo hóa đơn
    ├── SaleUnitList/         # Danh sách đơn vị bán hàng
    ├── CreateSaleUnit/       # Tạo đơn vị bán hàng
    └── RulePage/             # PrivatePage — bảo vệ route yêu cầu đăng nhập
```

### Quy Tắc Frontend

- **Mỗi page/component** có thư mục riêng với `index.tsx` làm entry export
- **Gọi API** luôn dùng hàm `request()` từ `src/api/request.tsx` — không dùng axios trực tiếp
- **Auth state** lấy qua hook `useAuth()` — không đọc `localStorage` trực tiếp trong component
- **UI components** tái sử dụng từ `src/components/ui/` (shadcn/ui), không tự tạo component cơ bản mới
- **Route bảo vệ** bọc bằng `<PrivatePage />` từ `pages/RulePage/`
- **Thông báo** dùng `sonner` toast, không dùng `alert()`
- **Avatar** luôn dùng `user?.avatar || DEFAULT_AVATAR` — hằng `DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=12"` khai báo local trong từng file cần dùng
- **`request.tsx`** trả về `Promise<any>` vì interceptor đã unwrap `res.data` — không cần `.data` khi dùng
