const UserModel = require("./user");

// [POST] /api/auth/login
const login = (req, res) => {
  console.log(req.body);
  res.send("Login successful");
};

//[POST] /api/auth/register
const register = async (req, res) => {
  const { username, password, fullName, email, phone } = req.body;
  const newUser = await UserModel.create({
    username,
    password,
    fullName,
    email,
    phone,
  });
  console.log("New user registered:", newUser);
  res.send({
    success: 1,
    data: {
      _id: newUser._id,
      username: newUser.username,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      createdAt: newUser.createdAt,
    },
  });
};

module.exports = { login, register };
