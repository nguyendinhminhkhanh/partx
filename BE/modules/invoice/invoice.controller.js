const mongoose = require("mongoose");
const InvoiceModel = require("./invoice");

//[POST] /api/invoice/create
const createInvoice = async (req, res) => {
  // Logic to create an invoice
  //lấy idSaleUnit thừ ô tim kiem theo tên công ty
  const idSaleUnit = "697a26073c7ee231f34c1442"; // Example SaleUnit ID
  const { productCode, productName, quantity, price, totalAmount, guarantee } =
    req.body;
  const newInvoice = await InvoiceModel.create({
    productCode,
    productName,
    quantity,
    price,
    totalAmount,
    guarantee,
    createdBy: idSaleUnit,
  });

  console.log("New Invoice Created:", newInvoice);
  res.send({
    success: 1,
    data: newInvoice,
  });
};




//[GET] /api/invoice/:id
const getInvoiceById = async (req, res) => {
  const { id } = req.params;
  const invoice = await InvoiceModel.findById(id).populate("createdBy");
  if (!invoice) {
    return res
      .status(404)
      .send({ success: 0, message: "Không tìm thấy hóa đơn" });
  }
  res.send({ success: 1, data: invoice });
};

module.exports = {
  createInvoice,
  getInvoiceById,
};
