"use strict";

/* ------------------------------------------------- */
/*                 TRADE JOURNAL API                 */
/* ------------------------------------------------- */

const mongoose = require("mongoose");
const validator = require("validator");

const StockSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    symbol: {
      type: String,
      required: [true, "Stock symbol is required"],
      uppercase: true,
      trim: true,
      minlength: [1, "Stock symbol must be at least 1 character"],
      maxlength: [10, "Stock symbol cannot exceed 10 characters"],
      validate: {
        validator: function (value) {
          return validator.isAlpha(value);
        },
        message: "Stock symbol can only contain letters",
      },
    },
    currentQuantity: {
      type: Number,
      default: 0,
      validate: {
        validator: function (value) {
          return validator.isFloat(value.toString(), { min: 0 });
        },
        message: "Quantity cannot be negative",
      },
    },
    averagePrice: {
      type: Number,
      default: 0,
      validate: {
        validator: function (value) {
          return validator.isFloat(value.toString(), { min: 0 });
        },
        message: "Average price cannot be negative",
      },
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    openDate: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function (value) {
          return validator.isDate(value) && value <= new Date();
        },
        message: "Open date cannot be in the future",
      },
    },
    closeDate: {
      type: Date,
      validate: {
        validator: function (value) {
          if (!value) return true;
          return validator.isDate(value) && value >= this.openDate;
        },
        message: "Close date cannot be before the open date",
      },
    },
    profitLoss: {
      type: Number,
      default: 0,
    },
    profitLossPercentage: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return !value || validator.isLength(value, { max: 1000 });
        },
        message: "Notes cannot exceed 1000 characters",
      },
    },
  },
  { collection: "stocks", timestamps: true }
);

// Calculate total value (virtual field)
StockSchema.virtual("currentValue").get(function () {
  return this.currentQuantity * this.averagePrice;
});

module.exports = mongoose.model("Stock", StockSchema);
