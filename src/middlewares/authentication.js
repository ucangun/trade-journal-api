"use strict";

/* ------------------------------------------------- */
/*                 TRADE JOURNAL API                 */
/* ------------------------------------------------- */

const Token = require("../models/token");

module.exports = async (req, res, next) => {
  req.user = null;

  const auth = req.headers?.authorization || null;
  const tokenKey = auth ? auth.split(" ") : null;

  if (tokenKey) {
    if (tokenKey[0] == "Token") {
      // SimpleToken
      const tokenData = await Token.findOne({ token: tokenKey[1] }).populate(
        "userId"
      );
      req.user = tokenData ? tokenData.userId : null;

      if (req.user) {
        req.body.userId = req.user._id;
      }
    }
  }
  next();
};
