"use strict";

/* ------------------------------------------------- */
/*                 TRADE JOURNAL API                 */
/* ------------------------------------------------- */

const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currentQuantity: {
      type: Number,
      default: 0,
    },
    averagePrice: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
    lastTradeDate: {
      type: Date,
    },
  },
  { collection: "stocks", timestamps: true }
);

stockSchema.virtual("currentValue").get(function () {
  return this.currentQuantity * this.averagePrice;
});

module.exports = mongoose.model("Stock", stockSchema);
