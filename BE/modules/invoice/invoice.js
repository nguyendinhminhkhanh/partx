const { required } = require("joi");
const mongoose = require("mongoose");
//hóa đơn bán hàng
const InvoiceSchema = mongoose.Schema(
  {
    imageUrl: {
      type: String,
      require: true,
    },
    productCode: { type: String },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, //đơn giá
    totalAmount: { type: Number, required: true }, //tổng tiền
    guarantee: { type: Number, required: true }, //thời gian bảo hành theo tháng
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SaleUnit",
    },
  },
  {
    timestamps: true,
  },
);
const UserModel = mongoose.model("Invoice", InvoiceSchema);
module.exports = UserModel;
