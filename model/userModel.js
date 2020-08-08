const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      default: "",
      unique: true,
    },
    macAddress: {
      type: String,
      default: "",
      unique: true,
    },
    voted: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
