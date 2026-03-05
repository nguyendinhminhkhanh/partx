const mongoose = require("mongoose");
const InvoiceModel = require("./invoice");

//[POST] /api/invoice/create
// Logic to create an invoice
const createInvoice = async (req, res) => {
  const {
    imageUrl,
    productCode,
    productName,
    quantity,
    price,
    guarantee,
    createdBy,
  } = req.body;
  const q = Number(quantity);
  const p = Number(price);
  if (!Number.isFinite(q) || !Number.isFinite(p)) {
    return res.status(400).json({
      success: 0,
      message: "Quantity và price phải là số",
    });
  }
  if (q <= 0 || p <= 0) {
    return res.status(400).json({
      success: 0,
      message: "Quantity và price phải > 0",
    });
  }
  const totalAmount = q * p;
  const newInvoice = await InvoiceModel.create({
    imageUrl,
    productCode,
    productName,
    quantity: q,
    price: p,
    totalAmount,
    guarantee,
    createdBy,
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

//[DELETE] /api/invoice/:id
const deleteInvoice = () => {
  console.log("del");
};

module.exports = {
  createInvoice,
  getAllInvoice,
  getInvoiceById,
};
