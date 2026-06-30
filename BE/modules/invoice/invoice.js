const { required } = require("joi");
const mongoose = require("mongoose");
//hóa đơn bán hàng
const InvoiceSchema = mongoose.Schema(
  {
    imageUrl: { type: String, required: false },
    items: [
      {
        productCode: { type: String },
        productName: { type: String, required: true },
        guarantee: { type: Number, default: 0 },
        quantity: { type: Number, required: true, default: 0 },
        price: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true, default: 0 },
      },
    ],
    totalAmount: { type: Number, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SaleUnit",
      required: true,
    },
    createdByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);
const UserModel = mongoose.model("Invoice", InvoiceSchema);
module.exports = UserModel;
