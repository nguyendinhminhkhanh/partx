const { required } = require("joi");
const mongoose = require("mongoose");
//hóa đơn bán hàng
const InvoiceSchema = mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    items: [
      {
        productCode: { type: String },
        productName: { type: String, required: true },
        guarantee: { type: Number, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SaleUnit",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
const UserModel = mongoose.model("Invoice", InvoiceSchema);
module.exports = UserModel;
