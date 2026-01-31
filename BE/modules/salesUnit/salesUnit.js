const mongoose = require("mongoose");
//đơn vị bán hàng
const SalesUnitSchema = mongoose.Schema(
  {
    companyName: { type: String, required: true },
    address: { type: String },
    taxCode: { type: String },// mã số thuế
    email: { type: String },
    website: { type: String },
    phone: { type: String },
  },
  {
    timestamps: true,
  },
);
const SalesUnitModel = mongoose.model("SaleUnit", SalesUnitSchema);
module.exports = SalesUnitModel;
