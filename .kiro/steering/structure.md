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
    ├── invoice/              # CRUD hóa đơn + thống kê + tìm kiếm/lọc
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

### API Invoice — các endpoint

| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/api/invoice/create` | Tạo hóa đơn |
| GET | `/api/invoice/stats/overview` | Thống kê tổng quan (phải đặt trước `/:id`) |
| GET | `/api/invoice` | Lấy danh sách, hỗ trợ query: `keyword`, `dateFrom`, `dateTo` |
| GET | `/api/invoice/:id` | Lấy chi tiết |
| PUT | `/api/invoice/:id` | Cập nhật |
| DELETE | `/api/invoice/:id` | Xóa |

### API SaleUnit — các endpoint

| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/api/saleunit/create` | Tạo đơn vị bán hàng |
| GET | `/api/saleunit` | Lấy tất cả |
| PUT | `/api/saleunit/:id` | Cập nhật |
| DELETE | `/api/saleunit/:id` | Xóa |
| GET | `/api/saleunit/:companyName` | Tìm theo tên (regex, không phân biệt hoa thường) |

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
│   ├── utils.ts              # Hàm tiện ích (cn() cho Tailwind class merging)
│   └── exportInvoice.ts      # Hàm xuất hóa đơn: exportInvoiceCSV, exportInvoicesCSV, printInvoice
├── components/
│   ├── ui/                   # shadcn/ui components (Button, Input, Dialog, Table, ...)
│   │   ├── price-input.tsx   # Input nhập số tiền/số lượng với format VND (focus: số thuần, blur: format)
│   │   └── tooltip.tsx       # Tooltip click-to-show, hỗ trợ mobile tap, có nút copy trên desktop
│   ├── Layout/               # MainLayout wrapper
│   ├── Navbar/               # Thanh điều hướng (desktop + mobile, hiển thị avatar từ AuthContext)
│   ├── ActionMenu/           # Menu hành động (edit/delete/export) — prop onExport optional
│   └── CreateInvoiceDialog/  # Dialog tạo hóa đơn (tự tạo SaleUnit mới nếu không tìm thấy)
└── pages/
    ├── Login/                # Đăng nhập
    ├── Register/             # Đăng ký
    ├── Home/                 # Trang chủ — biểu đồ thống kê (BarChart theo ngày, LineChart theo tháng)
    ├── Profile/              # Hồ sơ cá nhân (đổi avatar, cập nhật thông tin, đổi mật khẩu)
    ├── InvoiceList/          # Danh sách hóa đơn — tìm kiếm, lọc ngày, sửa, xóa, xuất
    ├── CreateInvoice/        # (Cũ — không dùng nữa, thay bằng CreateInvoiceDialog)
    ├── SaleUnitList/         # Danh sách đơn vị bán hàng — tìm kiếm, sửa, xóa
    ├── CreateSaleUnit/       # (Cũ — không dùng nữa)
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
- **Input số tiền/số lượng** dùng component `PriceInput` từ `src/components/ui/price-input.tsx` kết hợp với `Controller` của React Hook Form
- **Responsive** — không dùng 2 block `hidden md:block` / `md:hidden` riêng biệt; dùng chung header, tách Table (desktop) và Card (mobile) trong cùng một render
- **Xuất dữ liệu** — dùng các hàm trong `src/lib/exportInvoice.ts`, không cần thư viện ngoài

### Quy Tắc PriceInput

```tsx
// Dùng với Controller của React Hook Form
<Controller
  control={control}
  name="price"
  render={({ field }) => (
    <PriceInput value={field.value} onChange={field.onChange} showCurrency />
  )}
/>
```
- `showCurrency`: hiện ký hiệu `₫` ở góc phải
- Khi focus: hiển thị số thuần để dễ sửa
- Khi blur: format lại với dấu phân cách hàng nghìn

### Quy Tắc ActionMenu

```tsx
<ActionMenu
  onEdit={() => handleEdit(item)}
  onDelete={() => handleDelete(item._id)}
  onExport={() => printInvoice(item)}  // optional — chỉ truyền khi cần
/>
```
