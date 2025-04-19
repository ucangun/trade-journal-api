"use strict";

/* ------------------------------------------------- */
/*                 TRADE JOURNAL API                 */
/* ------------------------------------------------- */

// Stock Controllers:

const Stock = require("../models/Stock");
const CustomError = require("../errors/customError");

module.exports = {
  list: async (req, res) => {
    /* 
            #swagger.tags = ["Stock"]
            #swagger.summary = "List Stocks"
            #swagger.description = `
                You can use <u>filter[] & search[] & sort[] & page & limit</u> queries with endpoint.
                <ul> Examples:
                    <li>URL/?<b>filter[symbol]=AAPL&filter[isOpen]=true</b></li>
                    <li>URL/?<b>search[symbol]=APP&search[notes]=investment</b></li>
                    <li>URL/?<b>sort[symbol]=asc&sort[currentQuantity]=desc</b></li>
                    <li>URL/?<b>limit=10&page=1</b></li>
                </ul>
            `
        */

    // Only show stocks for the authenticated user
    const customFilter = { userId: req.user._id };

    const data = await res.getModelList(Stock, customFilter);

    res.status(200).send({
      error: false,
      message: "Stocks listed successfully",
      details: await res.getModelListDetails(Stock, customFilter),
      data,
    });
  },

  create: async (req, res) => {
    /* 
            #swagger.tags = ["Stock"]
            #swagger.summary = "Create Stock"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    $ref:"#/definitions/Stock"
                }
            }
        */

    const data = await Stock.create(req.body);

    res.status(201).send({
      error: false,
      message: "Stock created successfully",
      body: req.body,
      data,
    });
  },

  read: async (req, res) => {
    /* 
            #swagger.tags = ["Stock"]
            #swagger.summary = "Read Stock"
        */

    const data = await Stock.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!data) {
      throw new CustomError("Stock not found", 404);
    }

    res.status(200).send({
      error: false,
      message: "Stock retrieved successfully",
      data,
    });
  },

  update: async (req, res) => {
    /* 
            #swagger.tags = ["Stock"]
            #swagger.summary = "Update Stock"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    $ref:"#/definitions/Stock"
                }
            }
        */

    const data = await Stock.updateOne(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { runValidators: true }
    );

    if (data.matchedCount === 0) {
      throw new CustomError("Stock not found", 404);
    }

    res.status(200).send({
      error: false,
      message: "Stock updated successfully",
      data,
      new: await Stock.findOne({ _id: req.params.id }),
    });
  },

  deleteStock: async (req, res) => {
    /* 
            #swagger.tags = ["Stock"]
            #swagger.summary = "Delete Stock"
        */

    const data = await Stock.deleteOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      message: "Stock deleted successfully",
      data,
    });
  },

  listOpen: async (req, res) => {
    /* 
            #swagger.tags = ["Stock"]
            #swagger.summary = "List Open Stocks"
            #swagger.description = "List all open stock positions for the authenticated user"
        */

    // Only show open stocks for the authenticated user
    const customFilter = { userId: req.user._id, isOpen: true };

    const data = await res.getModelList(Stock, customFilter);

    res.status(200).send({
      error: false,
      message: "Open stocks listed successfully",
      details: await res.getModelListDetails(Stock, customFilter),
      data,
    });
  },
};
