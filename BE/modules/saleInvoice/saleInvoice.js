const mongoose = require("mongoose");

// Hóa đơn xuất hàng (bán ra cho khách)
const SaleInvoiceSchema = mongoose.Schema(
  {
    // Thông tin người mua
    buyerName: { type: String, required: true },   // Tên người mua
    buyerPhone: { type: String },                   // SĐT (không bắt buộc)
    buyerAddress: { type: String },                 // Địa chỉ (không bắt buộc)

    // Danh sách sản phẩm bán ra
    items: [
      {
        productCode: { type: String },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, default: 0 },
        price: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true, default: 0 },
        guarantee: { type: Number, default: 0 },
      },
    ],

    totalAmount: { type: Number, required: true },
    imageUrl: { type: String },
    note: { type: String },                         // Ghi chú (tuỳ chọn)
  },
  {
    timestamps: true,
  },
);

const SaleInvoiceModel = mongoose.model("SaleInvoice", SaleInvoiceSchema);
module.exports = SaleInvoiceModel;
