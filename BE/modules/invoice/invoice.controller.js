const mongoose = require("mongoose");
const InvoiceModel = require("./invoice");

//[POST] /api/invoice/create
// Logic to create an invoice
const createInvoice = async (req, res) => {
  try {
    const { imageUrl, items, createdBy } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: 0,
        message: "Invoice phải có ít nhất 1 sản phẩm",
      });
    }

    let totalAmount = 0;

    const processedItems = items.map((item) => {
      const q = Number(item.quantity);
      const p = Number(item.price);
      const g = Number(item.guarantee);

      if (!Number.isFinite(q) || !Number.isFinite(p)) {
        throw new Error("Quantity và price phải là số");
      }

      if (q <= 0 || p <= 0) {
        throw new Error("Quantity và price phải > 0");
      }

      const total = q * p;
      totalAmount += total;

      return {
        productCode: item.productCode,
        productName: item.productName,
        guarantee: g,
        quantity: q,
        price: p,
        total,
      };
    });

    const newInvoice = await InvoiceModel.create({
      imageUrl,
      items: processedItems,
      totalAmount,
      createdBy,
    });

    console.log("New Invoice Created:", newInvoice);

    res.send({
      success: 1,
      data: newInvoice,
    });
  } catch (error) {
    res.status(400).json({
      success: 0,
      message: error.message,
    });
  }
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
const deleteInvoice = async (req, res) => {
  const { id } = req.params;
  const deleteInvoice = await InvoiceModel.findByIdAndDelete(id);
  res.send({
    success: 1,
    data: deleteInvoice,
  });
};

module.exports = {
  createInvoice,
  getAllInvoice,
  getInvoiceById,
  deleteInvoice,
};
