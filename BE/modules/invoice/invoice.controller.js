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
      createdByUser: req.user._id,
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
const getAllInvoice = async (req, res) => {
  try {
    const { keyword, dateFrom, dateTo } = req.query;

    const filter = {};

    // Tìm theo tên sản phẩm trong mảng items
    if (keyword && keyword.trim()) {
      filter["items.productName"] = {
        $regex: new RegExp(keyword.trim(), "i"),
      };
    }

    // Lọc theo khoảng ngày tạo
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        // Bắt đầu từ 00:00:00 của ngày dateFrom
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Kết thúc đến 23:59:59 của ngày dateTo
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const invoices = await InvoiceModel.find(filter)
      .populate("createdBy")
      .populate("createdByUser", "fullName username avatar")
      .sort({ createdAt: -1 });

    res.send({ success: 1, data: invoices });
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
  const invoice = await InvoiceModel.findById(id)
    .populate("createdBy")
    .populate("createdByUser", "fullName username avatar");
  if (!invoice) {
    return res
      .status(404)
      .send({ success: 0, message: "Không tìm thấy hóa đơn" });
  }
  res.send({ success: 1, data: invoice });
};

//[PUT] /api/invoice/:id
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl, items, createdBy } = req.body;

    const invoice = await InvoiceModel.findById(id);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: 0, message: "Không tìm thấy hóa đơn" });
    }

    let totalAmount = 0;
    const processedItems = items.map((item) => {
      const q = Number(item.quantity);
      const p = Number(item.price);
      const total = q * p;
      totalAmount += total;
      return {
        productCode: item.productCode,
        productName: item.productName,
        guarantee: Number(item.guarantee),
        quantity: q,
        price: p,
        total,
      };
    });

    const updated = await InvoiceModel.findByIdAndUpdate(
      id,
      { imageUrl, items: processedItems, totalAmount, createdBy },
      { new: true },
    ).populate("createdBy");

    res.send({ success: 1, data: updated });
  } catch (error) {
    res.status(400).json({ success: 0, message: error.message });
  }
};

//[GET] /api/invoice/stats/overview
const getStats = async (req, res) => {
  try {
    const now = new Date();

    // ── Số hóa đơn theo ngày (30 ngày gần nhất) ──
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dailyRaw = await InvoiceModel.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            y: { $year: "$createdAt" },
            m: { $month: "$createdAt" },
            d: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
    ]);

    // Điền đủ 30 ngày (ngày không có hóa đơn = 0)
    const dailyMap = {};
    dailyRaw.forEach(({ _id, count, total }) => {
      const key = `${_id.y}-${String(_id.m).padStart(2, "0")}-${String(_id.d).padStart(2, "0")}`;
      dailyMap[key] = { count, total };
    });

    const daily = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      daily.push({
        date: key,
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        count: dailyMap[key]?.count ?? 0,
        total: dailyMap[key]?.total ?? 0,
      });
    }

    // ── Tổng tiền theo tháng (12 tháng gần nhất) ──
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(now.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRaw = await InvoiceModel.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
          count: { $sum: 1 },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]);

    const monthlyMap = {};
    monthlyRaw.forEach(({ _id, count, total }) => {
      monthlyMap[`${_id.y}-${_id.m}`] = { count, total };
    });

    const monthly = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      monthly.push({
        label: `T${d.getMonth() + 1}/${d.getFullYear()}`,
        count: monthlyMap[key]?.count ?? 0,
        total: monthlyMap[key]?.total ?? 0,
      });
    }

    // ── Tổng quan ──
    const totalInvoices = await InvoiceModel.countDocuments();
    const totalAmountResult = await InvoiceModel.aggregate([
      { $group: { _id: null, sum: { $sum: "$totalAmount" } } },
    ]);
    const totalAmount = totalAmountResult[0]?.sum ?? 0;

    // Tháng này
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthCount = await InvoiceModel.countDocuments({
      createdAt: { $gte: startOfMonth },
    });
    const thisMonthAmountResult = await InvoiceModel.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, sum: { $sum: "$totalAmount" } } },
    ]);
    const thisMonthAmount = thisMonthAmountResult[0]?.sum ?? 0;

    res.send({
      success: 1,
      data: {
        summary: { totalInvoices, totalAmount, thisMonthCount, thisMonthAmount },
        daily,
        monthly,
      },
    });
  } catch (error) {
    res.status(400).json({ success: 0, message: error.message });
  }
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
  updateInvoice,
  deleteInvoice,
  getStats,
};
