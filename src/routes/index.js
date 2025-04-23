"use strict";

/* ------------------------------------------------- */
/*                 TRADE JOURNAL API                 */
/* ------------------------------------------------- */

const router = require("express").Router();

/* ------------------------------------------------- */

// Auth:
router.use("/auth", require("./auth"));

// User:
router.use("/users", require("./user"));

// Capital Deposit:
router.use("/capital-deposits", require("./capitalDeposit"));

// Stock:
router.use("/stocks", require("./stock"));

// Transaction:
router.use("/transactions", require("./transaction"));

/* -------------------------------------------- */
module.exports = router;
