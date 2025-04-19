"use strict";

/* ------------------------------------------------- */
/*                 TRADE JOURNAL API                 */
/* ------------------------------------------------- */

const router = require("express").Router();

/* ------------------------------------------------- */

const {
  list,
  create,
  read,
  deleteCapitalDeposit,
  getTotalCapital,
} = require("../controllers/capitalDeposit");

router.get("/", list);
router.post("/", create);
router.get("/total-capital", getTotalCapital);
router.get("/:id", read);
router.delete("/:id", deleteCapitalDeposit);

/* ------------------------------------------------- */

module.exports = router;
