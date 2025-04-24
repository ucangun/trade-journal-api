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
  listClose,
  updateNotes,
} = require("../controllers/stock");

router.get("/", list);
router.post("/", create);
router.get("/open", listOpen);
router.get("/close", listClose);

router.get("/:id", read);
router.put("/:id", update);
router.delete("/:id", deleteStock);
router.put("/:id/notes", updateNotes);

/* ------------------------------------------------- */

module.exports = router;
