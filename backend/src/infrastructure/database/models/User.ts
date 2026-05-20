const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  organization: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["analyst", "admin", "manager"],
    default: "analyst",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Update `updatedAt` field before saving
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
