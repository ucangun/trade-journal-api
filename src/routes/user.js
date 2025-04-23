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
  deleteUser,
} = require("../controllers/user");

router.get("/", list);
router.post("/", create);
router.get("/:id", read);
router.put("/:id", update);
router.delete("/:id", deleteUser);

/* ------------------------------------------------- */

module.exports = router;
