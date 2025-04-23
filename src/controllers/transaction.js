"use strict";

/* ------------------------------------------------- */
/*                 TRADE JOURNAL API                 */
/* ------------------------------------------------- */

// Transaction Controllers:

const Transaction = require("../models/transaction");
const Stock = require("../models/Stock");
const CustomError = require("../errors/customError");
const CapitalDeposit = require("../models/capitalDeposit");
const User = require("../models/user");

module.exports = {
  list: async (req, res) => {
    /* 
            #swagger.tags = ["Transaction"]
            #swagger.summary = "List Transactions"
            #swagger.description = `
                You can use <u>filter[] & search[] & sort[] & page & limit</u> queries with endpoint.
                <ul> Examples:
                    <li>URL/?<b>filter[stockId]=60d21b4667d0d8992e610c85&filter[transactionType]=BUY</b></li>
                    <li>URL/?<b>search[comment]=investment</b></li>
                    <li>URL/?<b>sort[transactionDate]=desc&sort[price]=asc</b></li>
                    <li>URL/?<b>limit=10&page=1</b></li>
                </ul>
            `
        */

    // Only show transactions for the authenticated user
    const customFilter = { userId: req.user._id };

    if (req.query.stockId) {
      customFilter.stockId = req.query.stockId;
    }

    const data = await res.getModelList(Transaction, customFilter);

    res.status(200).send({
      error: false,
      message: "Transactions listed successfully",
      details: await res.getModelListDetails(Transaction, customFilter),
      data,
    });
  },

  create: async (req, res) => {
    /* 
            #swagger.tags = ["Transaction"]
            #swagger.summary = "Create Transaction"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    $ref:"#/definitions/Transaction"
                }
            }
        */

    const stock = await Stock.findOne({
      _id: req.body.stockId,
      userId: req.user._id,
    });

    if (!stock) {
      throw new CustomError("Stock not found", 404);
    }

    // Get the user to check and update totalCapital
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    // Calculate transaction total amount
    const transactionAmount = req.body.quantity * req.body.price;

    // Handle BUY transaction
    if (req.body.transactionType === "BUY") {
      // Check if user has enough capital
      if (user.totalCapital < transactionAmount) {
        throw new CustomError(
          "Insufficient funds. Please deposit more capital.",
          400
        );
      }

      // Deduct from user's totalCapital
      user.totalCapital -= transactionAmount;
      await user.save();

      // Create a capital deposit record for tracking
      await CapitalDeposit.create({
        userId: req.user._id,
        amount: transactionAmount,
        description: `Withdrawal for purchase of ${req.body.quantity} shares of ${stock.symbol} at ${req.body.price}`,
        type: "withdrawal",
        date: new Date(),
      });

      // Calculate new average price and quantity for BUY
      const oldValue = stock.currentQuantity * stock.averagePrice;
      const newValue = req.body.quantity * req.body.price;
      const newQuantity = stock.currentQuantity + req.body.quantity;
      const newAveragePrice =
        newQuantity > 0 ? (oldValue + newValue) / newQuantity : 0;

      // Update stock
      stock.currentQuantity = newQuantity;
      stock.averagePrice = newAveragePrice;
      stock.isOpen = true;
      stock.closeDate = null;
    }
    // Handle SELL transaction
    else if (req.body.transactionType === "SELL") {
      // Check if there's enough quantity to sell
      if (stock.currentQuantity < req.body.quantity) {
        throw new CustomError("Not enough quantity to sell", 400);
      }

      // Add to user's totalCapital
      user.totalCapital += transactionAmount;
      await user.save();

      // Create a capital deposit record for tracking
      await CapitalDeposit.create({
        userId: req.user._id,
        amount: transactionAmount,
        description: `Deposit from sale of ${req.body.quantity} shares of ${stock.symbol} at ${req.body.price}`,
        type: "deposit",
        date: new Date(),
      });

      // Calculate profit/loss for this transaction
      const transactionProfitLoss =
        (req.body.price - stock.averagePrice) * req.body.quantity;

      // Update stock quantity
      stock.currentQuantity -= req.body.quantity;

      // Update profit/loss
      stock.profitLoss += transactionProfitLoss;

      // Calculate profit/loss percentage
      if (stock.averagePrice > 0) {
        const profitLossPercentage =
          ((req.body.price - stock.averagePrice) / stock.averagePrice) * 100;
        stock.profitLossPercentage = profitLossPercentage;
      }

      // If quantity is 0, mark as closed
      if (stock.currentQuantity === 0) {
        stock.isOpen = false;
        stock.closeDate = new Date();
      }
    }

    // Save the updated stock
    await stock.save();

    // Create the transaction
    const transaction = await Transaction.create({
      ...req.body,
      userId: req.user._id,
    });

    res.status(201).send({
      error: false,
      message: "Transaction created successfully",
      body: req.body,
      data: transaction,
      updatedStock: stock,
      totalCapital: user.totalCapital,
    });
  },

  read: async (req, res) => {
    /* 
            #swagger.tags = ["Transaction"]
            #swagger.summary = "Read Transaction"
        */

    const data = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!data) {
      throw new CustomError("Transaction not found", 404);
    }

    res.status(200).send({
      error: false,
      message: "Transaction retrieved successfully",
      data,
    });
  },

  update: async (req, res) => {
    /* 
            #swagger.tags = ["Transaction"]
            #swagger.summary = "Update Transaction"
            #swagger.description = "Note: Updating transactions may require recalculating stock values"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    $ref:"#/definitions/Transaction"
                }
            }
        */

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      throw new CustomError("Transaction not found", 404);
    }

    if (
      req.body.stockId &&
      req.body.stockId.toString() !== transaction.stockId.toString()
    ) {
      throw new CustomError("Changing stockId is not allowed", 400);
    }

    if (
      req.body.transactionType &&
      req.body.transactionType !== transaction.transactionType
    ) {
      throw new CustomError("Changing transaction type is not allowed", 400);
    }

    // Update the transaction
    const data = await Transaction.updateOne(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { runValidators: true }
    );

    // If quantity or price changed, we need to recalculate stock values
    if (req.body.quantity !== undefined || req.body.price !== undefined) {
    }

    res.status(200).send({
      error: false,
      message: "Transaction updated successfully",
      data,
      new: await Transaction.findOne({ _id: req.params.id }),
    });
  },

  deleteTransaction: async (req, res) => {
    /* 
            #swagger.tags = ["Transaction"]
            #swagger.summary = "Delete Transaction"
            #swagger.description = "Note: Deleting transactions may require recalculating stock values"
        */

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      throw new CustomError("Transaction not found", 404);
    }

    // Delete the transaction
    const data = await Transaction.deleteOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      message: "Transaction deleted successfully",
      data,
    });
  },
};
