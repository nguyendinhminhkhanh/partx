const Joi = require("joi");

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required(),
  role: Joi.string().valid("owner", "admin", "staff").default("staff"),
});

const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(3).max(100),
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/),
  avatar: Joi.string().uri(),
}).min(1); // bắt buộc có ít nhất 1 trường

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().required(), // chỉ kiểm tra có gửi lên không, FE đã validate khớp
});

module.exports = {
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
};
