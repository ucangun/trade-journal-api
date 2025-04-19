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
  deleteStock,
  listOpen,
} = require("../controllers/stock");

router.get("/", list);
router.post("/", create);
router.get("/open", listOpen);
router.get("/:id", read);
router.put("/:id", update);
router.delete("/:id", deleteStock);

/* ------------------------------------------------- */

module.exports = router;
