"use strict";

/* ------------------------------------------------- */
/*                 TRADE JOURNAL API                 */
/* ------------------------------------------------- */

const User = require("../models/user");
const Token = require("../models/token");
const CustomError = require("../errors/customError");

const tokenHash = require("../helpers/tokenHash");

module.exports = {
  signup: async (req, res) => {
    /*
            #swagger.tags = ["Authentication"]
            #swagger.summary = "Signup"
            #swagger.description = 'Create a new user account.'
            #swagger.parameters["body"] = {
                in: "body",
                required: true,
                schema: {
                    "username": "testUser",
                    "firstName": "user",
                    "lastName": "user",
                    "email": "user@example.com",
                    "password": "password123!"
                }
            }
          
        */

    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });

    res.status(201).json({
      status: "success",
      message: "User created successfully",
    });
  },

  login: async (req, res) => {
    /*
            #swagger.tags = ["Authentication"]
            #swagger.summary = "Login"
            #swagger.description = 'Login with username (or email) and password to get Token and JWT.'
            #swagger.parameters["body"] = {
                in: "body",
                required: true,
                schema: {
                    "username": "testUser",
                    "password": "password123"
                }
            }
        */

    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      throw new CustomError("Please provide email and password!", 400);
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email });

    // 3) Compare  Password
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new CustomError("Incorrect email or password", 401);
    }

    // 4) If everything ok, send token to client

    // TOKEN:
    let tokenData = await Token.findOne({ userId: user._id });
    if (!tokenData)
      tokenData = await Token.create({
        userId: user._id,
        token: tokenHash(user._id + Date.now()),
      });

    // 5) Send response with token
    res.status(200).json({
      status: "success",
      token: tokenData.token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        totalCapital: user.totalCapital,
      },
    });
  },

  logout: async (req, res) => {
    /*
        #swagger.tags = ["Authentication"]
        #swagger.summary = "Logout"
        #swagger.description = 'Logout user by deleting the token.'
        #swagger.parameters["authorization"] = {
            in: "header",
            required: true,
            description: "Authorization token in 'Token <token>' format.",
            type: "string"
        }
    */
    const auth = req.headers?.authorization || null;

    if (!auth) {
      return res.status(400).json({
        status: "fail",
        message:
          "Authorization header is missing. Please provide a valid token.",
      });
    }

    const [tokenType, tokenValue] = auth.split(" ");

    if (tokenType !== "Token") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid token format. Use 'Token <value>'.",
      });
    }

    if (!tokenValue) {
      return res.status(400).json({
        status: "fail",
        message:
          "Token value is missing. Ensure the format is 'Token <value>'.",
      });
    }

    // Delete the token from database
    const result = await Token.deleteOne({ token: tokenValue });

    return res.status(result.deletedCount > 0 ? 200 : 404).json({
      status: result.deletedCount > 0 ? "success" : "fail",
      message:
        result.deletedCount > 0
          ? "Token deleted successfully. Logout completed."
          : "Token not found. It may have already been logged out.",
    });
  },
};
