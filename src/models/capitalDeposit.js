"use strict";

/* ------------------------------------------------- */
/*                 TRADE JOURNAL API                 */
/* ------------------------------------------------- */

const mongoose = require("mongoose");
const validator = require("validator");

const capitalDepositSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      validate: {
        validator: function (value) {
          return validator.isFloat(value.toString(), { min: 0.01 });
        },
        message: "Amount must be a positive number",
      },
    },
    date: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function (value) {
          return validator.isDate(value) && value <= new Date();
        },
        message: "Date cannot be in the future",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal"],
      default: "deposit",
    },
  },
  { collection: "capitalDeposits", timestamps: true }
);

module.exports = mongoose.model("CapitalDeposit", capitalDepositSchema);
