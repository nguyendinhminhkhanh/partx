const tokenProvider = require("../tokenProvider");
const UserModel = require("../../modules/auth/user");
const getUser = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return next();
  }

  const identityData = tokenProvider.verify(token);
  console.log("DARTA: ", identityData.userId);
  if (!identityData.userId) {
    next();
  }

  const existedUser = await UserModel.findById(identityData.userId);
  if (!existedUser) {
    next();
  }

  req.user = existedUser;
  next();
};

module.exports = getUser;
