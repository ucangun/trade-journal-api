"use strict";

/* ------------------------------------------------- */
/*                 TRADE JOURNAL API                 */
/* ------------------------------------------------- */

const router = require("express").Router();

/* ------------------------------------------------- */

// Auth:
router.use("/auth", require("./auth"));

// Capital Deposit:
router.use("/capital-deposits", require("./capitalDeposit"));

// Stock:
router.use("/stocks", require("./stock"));

/* -------------------------------------------- */
module.exports = router;
