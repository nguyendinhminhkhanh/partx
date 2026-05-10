# PartX API Documentation

**Base URL:** `http://localhost:3000/api`

**Auth:** Token JWT gửi qua header `Authorization: <token>` (không có prefix Bearer)

**Response format:**
- Thành công: `{ success: 1, data: ... }`
- Thất bại: `{ success: 0, message: "..." }`

---

## Auth — `/api/auth`

### POST /api/auth/register
Đăng ký tài khoản mới.

**Body (JSON):**
```json
{
  "username": "johndoe",
  "password": "123456",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "0901234567"
}
```

**Response:**
```json
{
  "success": 1,
  "data": {
    "_id": "...",
    "username": "johndoe",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "0901234567",
    "role": "staff",
    "avatar": "https://i.pravatar.cc/150?img=12",
    "createdAt": "...",
    "token": "<jwt_token>"
  }
}
```

---

### POST /api/auth/login
Đăng nhập.

**Body (JSON):**
```json
{
  "username": "johndoe",
  "password": "123456"
}
```

**Response:** Tương tự register, có `token`.

---

### GET /api/auth/me
Lấy thông tin user đang đăng nhập.

**Header:** `Authorization: <token>`

**Response:**
```json
{
  "success": 1,
  "data": {
    "_id": "...",
    "username": "johndoe",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "0901234567",
    "role": "staff",
    "avatar": "https://...",
    "createdAt": "..."
  }
}
```

---

### PUT /api/auth/update
Cập nhật thông tin hồ sơ. Yêu cầu đăng nhập.

**Header:** `Authorization: <token>`

**Body (JSON) — ít nhất 1 trường:**
```json
{
  "fullName": "John Updated",
  "email": "new@example.com",
  "phone": "0909999999",
  "avatar": "https://res.cloudinary.com/..."
}
```

---

### PUT /api/auth/change-password
Đổi mật khẩu. Yêu cầu đăng nhập.

**Header:** `Authorization: <token>`

**Body (JSON):**
```json
{
  "currentPassword": "123456",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

**Response:**
```json
{
  "success": 1,
  "message": "Đổi mật khẩu thành công"
}
```

---

## Upload — `/api/upload`

### POST /api/upload
Upload file lên Cloudinary.

**Header:** `Authorization: <token>`

**Body (form-data):**
| Key  | Type | Value          |
|------|------|----------------|
| file | File | chọn file ảnh  |

**Định dạng hỗ trợ:** jpg, png, jpeg, gif, pdf, docx

**Response:**
```json
{
  "success": 1,
  "message": "Upload file thành công",
  "url": "https://res.cloudinary.com/..."
}
```

---

### DELETE /api/upload
Xóa file trên Cloudinary.

**Header:** `Authorization: <token>`

**Body (JSON):**
```json
{
  "imageUrl": "https://res.cloudinary.com/dxsum70nx/image/upload/v.../partx_uploads/abc123.jpg"
}
```

---

## SaleUnit — `/api/saleunit`

### POST /api/saleunit/create
Tạo đơn vị bán hàng mới.

**Body (JSON):**
```json
{
  "companyName": "Công ty TNHH ABC",
  "address": "123 Nguyễn Huệ, Q1, TP.HCM",
  "taxCode": "0123456789",
  "email": "contact@abc.com",
  "website": "https://abc.com",
  "phone": "0281234567"
}
```

---

### GET /api/saleunit
Lấy danh sách tất cả đơn vị bán hàng (sắp xếp mới nhất trước).

**Response:**
```json
{
  "success": 1,
  "data": [...]
}
```

---

### GET /api/saleunit/:companyName
Tìm kiếm đơn vị bán hàng theo tên (không phân biệt hoa thường).

**Ví dụ:** `GET /api/saleunit/abc`

---

### DELETE /api/saleunit/:id
Xóa đơn vị bán hàng theo ID.

**Ví dụ:** `DELETE /api/saleunit/64f1a2b3c4d5e6f7a8b9c0d1`

---

## Invoice — `/api/invoice`

> Tất cả endpoints đều yêu cầu `Authorization: <token>`

### POST /api/invoice/create
Tạo hóa đơn mới.

**Header:** `Authorization: <token>`

**Body (JSON):**
```json
{
  "imageUrl": "https://res.cloudinary.com/...",
  "createdBy": "<saleUnit_id>",
  "items": [
    {
      "productCode": "SP001",
      "productName": "Màn hình Samsung 24 inch",
      "quantity": 2,
      "price": 3500000,
      "guarantee": 24
    }
  ]
}
```

**Response:**
```json
{
  "success": 1,
  "data": {
    "_id": "...",
    "imageUrl": "...",
    "items": [...],
    "totalAmount": 7000000,
    "createdBy": "<saleUnit_id>",
    "createdAt": "..."
  }
}
```

---

### GET /api/invoice
Lấy danh sách hóa đơn. Hỗ trợ filter.

**Header:** `Authorization: <token>`

**Query params (tùy chọn):**
| Param     | Mô tả                        |
|-----------|------------------------------|
| createdBy | Lọc theo SaleUnit ID         |
| keyword   | Tìm theo title/description   |

**Ví dụ:** `GET /api/invoice?createdBy=64f1a2b3c4d5e6f7a8b9c0d1`

---

### GET /api/invoice/:id
Lấy chi tiết hóa đơn theo ID (có populate thông tin SaleUnit).

**Header:** `Authorization: <token>`

---

### DELETE /api/invoice/:id
Xóa hóa đơn theo ID.

**Header:** `Authorization: <token>`
