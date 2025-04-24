"use strict";

/* ------------------------------------------------- */
/*                 TRADE JOURNAL API                 */
/* ------------------------------------------------- */

const mongoose = require("mongoose");
const validator = require("validator");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: [true, "Stock ID is required"],
    },
    transactionType: {
      type: String,
      enum: {
        values: ["BUY", "SELL"],
        message: "Transaction type must be either BUY or SELL",
      },
      required: [true, "Transaction type is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      validate: {
        validator: function (value) {
          return validator.isFloat(value.toString(), { min: 0.01 });
        },
        message: "Quantity must be greater than zero",
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      validate: {
        validator: function (value) {
          return validator.isFloat(value.toString(), { min: 0.01 });
        },
        message: "Price must be greater than zero",
      },
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    comment: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return !value || validator.isLength(value, { max: 500 });
        },
        message: "Comment cannot exceed 500 characters",
      },
    },
  },
  { collection: "transactions", timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
