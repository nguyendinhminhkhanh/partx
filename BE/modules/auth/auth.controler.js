const UserModel = require("./user");
const bcrypt = require("bcryptjs");
const tokenProvider = require("../../common/tokenProvider");
const HttpError = require("../../common/httpError");
// [POST] /api/auth/login
const login = async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await UserModel.findOne({ username });
  if (!existingUser) {
    throw new HttpError("Username không tồn tại", 404);
  }
  const hashPassword = existingUser.password;
  const isPasswordValid = await bcrypt.compare(password, hashPassword);
  if (!isPasswordValid) {
    throw new HttpError("Đăng nhập thất bại", 401);
  }

  if (!username || !password) {
    throw new HttpError("Username và Password không được để trống", 422);
  }

  const token = tokenProvider.sign(existingUser._id);
  console.log("Generated Token:", token);
  res.send({
    success: 1,
    data: {
      _id: existingUser._id,
      username: existingUser.username,
      fullName: existingUser.fullName,
      email: existingUser.email,
      phone: existingUser.phone,
      role: existingUser.role,
      createdAt: existingUser.createdAt,
      token: token,
    },
  });
};

//[POST] /api/auth/register
const register = async (req, res) => {
  const { username, password, fullName, email, phone } = req.body;
  if (!username) {
    throw new HttpError("Username không được để trống", 422);
  }

  const existingUser = await UserModel.findOne({ username });
  if (existingUser) {
    throw new HttpError("Username đã tồn tại", 409);
  }

  if (!password && password.length < 6) {
    throw new HttpError("Password cầm ít nhất 6 kí tự", 422);
  }

  const salt = await bcrypt.genSalt(10); // mã hoá
  const hashPassword = await bcrypt.hash(password, salt);

  const newUser = await UserModel.create({
    username,
    password: hashPassword,
    fullName,
    email,
    phone,
  });

  const token = tokenProvider.sign(newUser._id);
  console.log("Generated Token:", token);
  res.send({
    success: 1,
    data: {
      _id: newUser._id,
      username: newUser.username,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      createdAt: newUser.createdAt,
      role: newUser.role,
      token: token,
    },
  });
};

module.exports = { login, register };
