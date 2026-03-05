//thông tin nhà cung cấp hàng hóa cho minhg
// cần có chứ năng check xem đơn vị bán hàng đã tồn tại chưa nếu chưa thì mới tạo mới
const SalesUnitModel = require("./salesUnit");

// [POST] /api/salesUnit/create
const createSalesUnit = async (req, res) => {
  const { companyName, address, taxCode, email, website, phone } = req.body;
  const existingUnit = await SalesUnitModel.findOne({ companyName });
  if (existingUnit) {
    return res
      .status(409)
      .send({ success: 0, message: "Đơn vị bán hàng đã tồn tại" });
  }
  const newSalesUnit = await SalesUnitModel.create({
    companyName,
    address,
    taxCode,
    email,
    website,
    phone,
  });
  res.send({
    success: 1,
    data: newSalesUnit,
  });
};

//[GET] /api/salesUnit/:id
const getSalesUnitById = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const salesUnit = await SalesUnitModel.findById(id);
  if (!salesUnit) {
    return res
      .status(404)
      .send({ success: 0, message: "Không tìm thấy đơn vị bán hàng" });
  }
  res.send({ success: 1, data: salesUnit });
};
//[GET] /api/salesUnit/:companyName
const getSalesUnitByCom = async (req, res) => {
  const { companyName } = req.params;

  const salesUnit = await SalesUnitModel.find({
    companyName: { $regex: companyName, $options: "i" },
  });
  if (!salesUnit) {
    return res
      .status(404)
      .send({ success: 0, message: "Không tìm thấy đơn vị bán hàng" });
  }
  res.send({ success: 1, data: salesUnit });
};

module.exports = {
  createSalesUnit,
  getSalesUnitById,
  getSalesUnitByCom,
};
