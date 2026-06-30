const mongoose = require("mongoose");
const UserSchema = mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },

    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    avatar: String,

    role: {
      type: String,
      enum: ["owner", "admin", "staff"],
      default: "staff",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);
const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
