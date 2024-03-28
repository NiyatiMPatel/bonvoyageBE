import express from "express";
import { body } from "express-validator";
import {
  loginController,
  logoutController,
  verifyTokenController,
} from "../controllers/auth.controller";
import verifyToken from "../middleware/auth.middleware";

const router = express.Router();

// USER LOGIN ROUTE/ENDPOINT
router.post(
  "/login",
  [
    body("email", "Email is Required").isEmail(),
    body("password", "Password with 6 or more characters required").isLength({
      min: 6,
    }),
  ],
  loginController
);

// COOKIE TOKEN VALIDATION ROUTE/ENDPOINT - THIS TAKES HTTP COOKIE, TAKES TOKEN FROM IT AND CHECKS IF IT IS VALID - THIS WILL HELP TO IDENTIFY IF THE USER IS LOGGED IN OR NOT AT THE FRONTEND
router.get("/validate-token", verifyToken, verifyTokenController);

// USER LOGOUT ROUTE/ENDPOINT
router.post("/logout", logoutController);

export default router;
