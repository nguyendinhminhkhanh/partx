const mongoose = require("mongoose");
const InvoiceModel = require("./invoice");

//[POST] /api/invoice/create
const createInvoice = async (req, res) => {
  // Logic to create an invoice
  //lấy idSaleUnit thừ ô tim kiem theo tên công ty
  const idSaleUnit = "6980c2eb6d2dd97b543839d0"; // Example SaleUnit ID
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

//[GET] /api/invoice
//!!
const getAllInvoice = async (req, res) => {
  try {
    const { createdBy, keyword } = req.query;
    const createByFilter = createdBy ? { createdBy } : {};
    const keywordFilter = keyword
      ? {
          $or: [
            { title: { $regex: new RegExp(`${keyword}`, "i") } },
            { description: { $regex: new RegExp(`${keyword}`, "i") } },
          ],
        }
      : {};
    const filter = {
      ...createByFilter,
      ...keywordFilter,
    };
    const invoice = await InvoiceModel.find(filter)
      .populate("createdBy")
      .sort({ createdAt: -1 });
    res.send({ success: 1, data: invoice });
  } catch (error) {
    res.status(400).send({
      success: 0,
      data: null,
      message: error.message || "Something went wrong",
    });
  }
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
  getAllInvoice,
  getInvoiceById,
};
