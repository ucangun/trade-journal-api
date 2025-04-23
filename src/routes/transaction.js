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
  update,
  deleteTransaction,
} = require("../controllers/transaction");

router.get("/", list);
router.post("/", create);
router.get("/:id", read);
router.put("/:id", update);
router.delete("/:id", deleteTransaction);

/* ------------------------------------------------- */

module.exports = router;
