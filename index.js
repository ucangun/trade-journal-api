"use strict";

/* ------------------------------------------------- */
/*                 TRADE JOURNAL API                 */
/* ------------------------------------------------- */

const cors = require("cors");
const express = require("express");
const app = express();

/* ------------------------------------------------- */

// envVariables to process.env:
require("dotenv").config();
const HOST = process.env?.HOST || "127.0.0.1";
const PORT = process.env?.PORT || 8000;

// asyncErrors to errorHandler:
require("express-async-errors");

/* ------------------------------------------------- */
// Configrations:

// DB Connection
const connectDB = require("./src/configs/dbConnection");
connectDB();

/* ------------------------------------------------- */

// Middlewares:

// Cors
const corsOptions = {
  origin: [process.env.LOCAL_CLIENT_URL, process.env.CLIENT_URL],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));

/* ------------------------------------------------- */

// Accept JSON:
app.use(express.json());

/* ------------------------------------------------- */

// Routes:

// HomePath:
app.all("/", (req, res) => {
  res.send({
    error: false,
    message: "Welcome to Trade Journal Api",
  });
});

/* ------------------------------------------------- */

// RUN SERVER:
app.listen(PORT, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

/* ------------------------------------------------------- */
