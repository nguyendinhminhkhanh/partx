const HttpError = require("../httpError");

// Dùng sau middleware isAuth
const isAdmin = (req, res, next) => {
  const { user } = req;
  if (!user || user.role !== "admin") {
    throw new HttpError("Không có quyền truy cập", 403);
  }
  next();
};

module.exports = isAdmin;
