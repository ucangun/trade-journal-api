"use strict";

/* ------------------------------------------------- */
/*                 TRADE JOURNAL API                 */
/* ------------------------------------------------- */

// CapitalDeposit Controllers:

const CapitalDeposit = require("../models/capitalDeposit");
const User = require("../models/user");
const CustomError = require("../errors/customError");

module.exports = {
  list: async (req, res) => {
    /* 
            #swagger.tags = ["CapitalDeposit"]
            #swagger.summary = "List Capital Deposits"
            #swagger.description = `
                You can use <u>filter[] & search[] & sort[] & page & limit</u> queries with endpoint.
                <ul> Examples:
                    <li>URL/?<b>filter[type]=deposit&filter[date]=2023-01-01</b></li>
                    <li>URL/?<b>search[description]=investment</b></li>
                    <li>URL/?<b>sort[date]=desc&sort[amount]=desc</b></li>
                    <li>URL/?<b>limit=10&page=1</b></li>
                </ul>
            `
        */

    // Only show deposits for the authenticated user
    const customFilter = { userId: req.user._id };

    const data = await res.getModelList(CapitalDeposit, customFilter);

    res.status(200).send({
      error: false,
      message: "Capital deposits listed successfully",
      details: await res.getModelListDetails(CapitalDeposit, customFilter),
      data,
    });
  },

  create: async (req, res) => {
    /* 
            #swagger.tags = ["CapitalDeposit"]
            #swagger.summary = "Create Capital Deposit"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    $ref:"#/definitions/CapitalDeposit"
                }
            }
        */

    // Update user's totalCapital first
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    if (req.body.type === "deposit") {
      user.totalCapital += Number(req.body.amount);
    } else if (req.body.type === "withdrawal") {
      // Check if user has enough capital
      if (user.totalCapital < Number(req.body.amount)) {
        throw new CustomError("Insufficient capital for withdrawal", 400);
      }
      user.totalCapital -= Number(req.body.amount);
    }

    await user.save();

    // Create the capital deposit
    const deposit = await CapitalDeposit.create(req.body);

    res.status(201).send({
      error: false,
      message: "Capital deposit created successfully",
      body: req.body,
      data: deposit,
    });
  },

  read: async (req, res) => {
    /* 
            #swagger.tags = ["CapitalDeposit"]
            #swagger.summary = "Read Capital Deposit"
        */

    const data = await CapitalDeposit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!data) {
      throw new CustomError("Capital deposit not found", 404);
    }

    res.status(200).send({
      error: false,
      message: "Capital deposit retrieved successfully",
      data,
    });
  },

  deleteCapitalDeposit: async (req, res) => {
    /* 
            #swagger.tags = ["CapitalDeposit"]
            #swagger.summary = "Delete Capital Deposit"
        */

    const deposit = await CapitalDeposit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deposit) {
      throw new CustomError("Capital deposit not found", 404);
    }

    // Update user's totalCapital
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    if (deposit.type === "deposit") {
      user.totalCapital -= Number(deposit.amount);
    } else if (deposit.type === "withdrawal") {
      user.totalCapital += Number(deposit.amount);
    }

    await user.save();

    // Delete the deposit
    const data = await CapitalDeposit.deleteOne({ _id: req.params.id });

    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      message: "Capital deposit deleted successfully",
      data,
    });
  },

  getTotalCapital: async (req, res) => {
    /* 
            #swagger.tags = ["CapitalDeposit"]
            #swagger.summary = "Get Total Capital"
        */

    const user = await User.findById(req.user._id);

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    res.status(200).send({
      error: false,
      message: "Total capital retrieved successfully",
      data: {
        totalCapital: user.totalCapital,
      },
    });
  },
};
