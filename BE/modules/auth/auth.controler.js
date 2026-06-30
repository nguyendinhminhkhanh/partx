const UserModel = require("./user");
const bcrypt = require("bcryptjs");
const tokenProvider = require("../../common/tokenProvider");
const HttpError = require("../../common/httpError");

const DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=12";

// [POST] /api/auth/login
const login = async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await UserModel.findOne({ username });
  if (!existingUser) {
    throw new HttpError("Username không tồn tại", 404);
  }

  if (!username || !password) {
    throw new HttpError("Username và Password không được để trống", 422);
  }

  // Kiểm tra tài khoản đã được duyệt chưa
  // Tài khoản cũ không có status (undefined) vẫn cho đăng nhập bình thường
  if (existingUser.status === "pending") {
    throw new HttpError("Tài khoản đang chờ admin duyệt", 403);
  }

  const hashPassword = existingUser.password;
  const isPasswordValid = await bcrypt.compare(password, hashPassword);
  if (!isPasswordValid) {
    throw new HttpError("Đăng nhập thất bại", 401);
  }

  const token = tokenProvider.sign(existingUser._id);
  res.send({
    success: 1,
    data: {
      _id: existingUser._id,
      username: existingUser.username,
      fullName: existingUser.fullName,
      email: existingUser.email,
      phone: existingUser.phone,
      role: existingUser.role,
      status: existingUser.status,
      avatar: existingUser.avatar || DEFAULT_AVATAR,
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

  if (!password || password.length < 6) {
    throw new HttpError("Password cần ít nhất 6 kí tự", 422);
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  const newUser = await UserModel.create({
    username,
    password: hashPassword,
    fullName,
    email,
    phone,
    avatar: DEFAULT_AVATAR,
    status: "pending", // chờ admin duyệt
  });

  res.status(201).send({
    success: 1,
    message: "Đăng ký thành công. Vui lòng chờ admin duyệt tài khoản.",
    data: {
      _id: newUser._id,
      username: newUser.username,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      status: newUser.status,
      createdAt: newUser.createdAt,
    },
  });
};

// [GET] /api/auth/me
const getUserInfor = async (req, res) => {
  const { user } = req;
  const userInfor = user
    ? {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        createdAt: user.createdAt,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar || DEFAULT_AVATAR,
      }
    : null;
  res.send({ success: 1, data: userInfor });
};

// [PUT] /api/auth/update
const updateProfile = async (req, res) => {
  const { user } = req;
  const { fullName, email, phone, avatar } = req.body;

  const updatedUser = await UserModel.findByIdAndUpdate(
    user._id,
    { fullName, email, phone, avatar },
    { new: true, runValidators: true }
  );

  res.send({
    success: 1,
    data: {
      _id: updatedUser._id,
      username: updatedUser.username,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      avatar: updatedUser.avatar || DEFAULT_AVATAR,
      createdAt: updatedUser.createdAt,
    },
  });
};

// [PUT] /api/auth/change-password
const changePassword = async (req, res) => {
  const { user } = req;
  const { currentPassword, newPassword } = req.body;

  console.log("=== changePassword ===");
  console.log("user._id:", user._id);
  console.log("user.password từ DB:", user.password);
  console.log("currentPassword nhập vào:", currentPassword);

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  console.log("bcrypt.compare result:", isPasswordValid);

  if (!isPasswordValid) {
    throw new HttpError("Mật khẩu hiện tại không đúng", 401);
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(newPassword, salt);

  await UserModel.findByIdAndUpdate(user._id, { password: hashPassword });

  res.send({ success: 1, message: "Đổi mật khẩu thành công" });
};

// [GET] /api/auth/accounts — Lấy danh sách tài khoản (admin only)
// Query: ?status=pending|active|all
const getAccounts = async (req, res) => {
  const { status } = req.query;
  const filter = status && status !== "all" ? { status } : {};
  const users = await UserModel.find(filter)
    .select("-password")
    .sort({ createdAt: -1 });
  res.send({ success: 1, data: users });
};

// [PUT] /api/auth/accounts/:id/status — Duyệt hoặc từ chối tài khoản (admin only)
const updateAccountStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["active", "pending"].includes(status)) {
    throw new HttpError("Status không hợp lệ", 400);
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).select("-password");

  if (!updatedUser) {
    throw new HttpError("Không tìm thấy tài khoản", 404);
  }

  const message = status === "active" ? "Duyệt tài khoản thành công" : "Đã từ chối tài khoản";
  res.send({ success: 1, message, data: updatedUser });
};

module.exports = { login, register, getUserInfor, updateProfile, changePassword, getAccounts, updateAccountStatus };
