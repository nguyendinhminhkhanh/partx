# Tổng Quan Sản Phẩm

**PartX** là ứng dụng quản lý bán hàng nội bộ, hỗ trợ các đơn vị kinh doanh tạo và theo dõi hóa đơn bán hàng.

## Tính Năng Chính

- **Xác thực người dùng**: Đăng ký, đăng nhập, phân quyền theo vai trò (`owner`, `admin`, `staff`)
- **Quản lý đơn vị bán hàng (SaleUnit)**: Tạo, sửa, xóa, tìm kiếm công ty/đại lý (tên, địa chỉ, mã số thuế, liên hệ)
- **Quản lý hóa đơn (Invoice)**:
  - Tạo hóa đơn với danh sách sản phẩm, số lượng, đơn giá, bảo hành và tổng tiền tự động
  - Sửa, xóa hóa đơn
  - Tìm kiếm theo tên sản phẩm, lọc theo khoảng ngày tạo
  - Xuất hóa đơn ra file CSV (Excel) hoặc in/xuất PDF qua print dialog
- **Upload ảnh**: Tải ảnh lên Cloudinary, đính kèm vào hóa đơn
- **Trang chủ thống kê**: Biểu đồ số hóa đơn theo ngày (30 ngày), tổng giá trị theo tháng (12 tháng), các thẻ tóm tắt tổng quan

## Đối Tượng Sử Dụng

Nhân viên và quản lý nội bộ của các đơn vị kinh doanh.

## Ngôn Ngữ

Toàn bộ thông báo lỗi, nhãn giao diện và comment trong code sử dụng **tiếng Việt**.
