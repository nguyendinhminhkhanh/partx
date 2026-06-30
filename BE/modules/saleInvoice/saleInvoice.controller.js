const SaleInvoiceModel = require("./saleInvoice");

// [POST] /api/saleinvoice/create
const createSaleInvoice = async (req, res) => {
  try {
    const { buyerName, buyerPhone, buyerAddress, items, imageUrl, note } =
      req.body;

    if (!buyerName || !buyerName.trim()) {
      return res
        .status(400)
        .json({ success: 0, message: "Tên người mua không được để trống" });
    }

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: 0, message: "Hóa đơn phải có ít nhất 1 sản phẩm" });
    }

    let totalAmount = 0;
    const processedItems = items.map((item) => {
      const q = Number(item.quantity);
      const p = Number(item.price);

      if (!Number.isFinite(q) || !Number.isFinite(p)) {
        throw new Error("Số lượng và đơn giá phải là số");
      }

      const total = q * p;
      totalAmount += total;

      return {
        productCode: item.productCode,
        productName: item.productName,
        quantity: q,
        price: p,
        total,
        guarantee: Number(item.guarantee) || 0,
      };
    });

    const newInvoice = await SaleInvoiceModel.create({
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone?.trim() || undefined,
      buyerAddress: buyerAddress?.trim() || undefined,
      items: processedItems,
      totalAmount,
      imageUrl,
      note: note?.trim() || undefined,
      createdByUser: req.user._id,
    });

    res.send({ success: 1, data: newInvoice });
  } catch (error) {
    res.status(400).json({ success: 0, message: error.message });
  }
};

// [GET] /api/saleinvoice
const getAllSaleInvoice = async (req, res) => {
  try {
    const { keyword, dateFrom, dateTo } = req.query;
    const filter = {};

    // Tìm theo tên sản phẩm hoặc tên người mua
    if (keyword && keyword.trim()) {
      filter.$or = [
        { "items.productName": { $regex: new RegExp(keyword.trim(), "i") } },
        { buyerName: { $regex: new RegExp(keyword.trim(), "i") } },
      ];
    }

    // Lọc theo khoảng ngày
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const invoices = await SaleInvoiceModel.find(filter)
      .populate("createdByUser", "fullName username avatar")
      .sort({ createdAt: -1 });
    res.send({ success: 1, data: invoices });
  } catch (error) {
    res
      .status(400)
      .json({ success: 0, message: error.message || "Something went wrong" });
  }
};

// [GET] /api/saleinvoice/:id
const getSaleInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await SaleInvoiceModel.findById(id)
      .populate("createdByUser", "fullName username avatar");
    if (!invoice) {
      return res
        .status(404)
        .json({ success: 0, message: "Không tìm thấy hóa đơn xuất" });
    }
    res.send({ success: 1, data: invoice });
  } catch (error) {
    res.status(400).json({ success: 0, message: error.message });
  }
};

// [PUT] /api/saleinvoice/:id
const updateSaleInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { buyerName, buyerPhone, buyerAddress, items, imageUrl, note } =
      req.body;

    const invoice = await SaleInvoiceModel.findById(id);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: 0, message: "Không tìm thấy hóa đơn xuất" });
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
        quantity: q,
        price: p,
        total,
        guarantee: Number(item.guarantee) || 0,
      };
    });

    const updated = await SaleInvoiceModel.findByIdAndUpdate(
      id,
      {
        buyerName,
        buyerPhone,
        buyerAddress,
        items: processedItems,
        totalAmount,
        imageUrl,
        note,
      },
      { new: true },
    );

    res.send({ success: 1, data: updated });
  } catch (error) {
    res.status(400).json({ success: 0, message: error.message });
  }
};

// [GET] /api/saleinvoice/stats/overview
const getSaleInvoiceStats = async (req, res) => {
  try {
    const now = new Date();

    // 30 ngày gần nhất
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dailyRaw = await SaleInvoiceModel.aggregate([
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

    // 12 tháng gần nhất
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(now.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRaw = await SaleInvoiceModel.aggregate([
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

    // Tổng quan
    const totalInvoices = await SaleInvoiceModel.countDocuments();
    const totalAmountResult = await SaleInvoiceModel.aggregate([
      { $group: { _id: null, sum: { $sum: "$totalAmount" } } },
    ]);
    const totalAmount = totalAmountResult[0]?.sum ?? 0;

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthCount = await SaleInvoiceModel.countDocuments({
      createdAt: { $gte: startOfMonth },
    });
    const thisMonthAmountResult = await SaleInvoiceModel.aggregate([
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

// [DELETE] /api/saleinvoice/:id
const deleteSaleInvoice = async (req, res) => {  try {
    const { id } = req.params;
    const deleted = await SaleInvoiceModel.findByIdAndDelete(id);
    res.send({ success: 1, data: deleted });
  } catch (error) {
    res.status(400).json({ success: 0, message: error.message });
  }
};

module.exports = {
  createSaleInvoice,
  getAllSaleInvoice,
  getSaleInvoiceById,
  updateSaleInvoice,
  deleteSaleInvoice,
  getSaleInvoiceStats,
};
