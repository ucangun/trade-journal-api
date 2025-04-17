"use strict";

/* ------------------------------------------------- */
/*                 TRADE JOURNAL API                 */
/* ------------------------------------------------- */

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const validatePassword = require("../helpers/validatePassword");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      validate: {
        validator: validatePassword,
        message:
          "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one special character.",
      },
    },

    firstName: {
      type: String,
      required: [true, "First name is required"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
    },

    totalCapital: {
      type: Number,
      default: 0,
      validate: {
        validator: function (value) {
          return validator.isFloat(value.toString(), { min: 0 });
        },
        message: "Total capital cannot be negative",
      },
    },
  },

  { collection: "users", timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model("User", userSchema);
