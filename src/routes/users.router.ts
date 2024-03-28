import express from "express";
import { body } from "express-validator";
import {
  currentUser,
  registerController,
} from "../controllers/users.controller";
import verifyToken from "../middleware/auth.middleware";

const router = express.Router();

// USER REGISTRATION REQUEST
router.post(
  "/register",
  // VALIDATE REQUEST BODY USING EXPRESS-VALIDATOR ON EACH OF THE PROPERTIES. IF ANY ERROR IS PRESENT, VALIDATOR ATTACHES IT TO REQUEST WHICH IS FORWARDED TO CONTROLLER FUNCTION
  [
    body("firstName", "Firstname is Required").isString(),
    body("lastName", "Lastname is Required").isString(),
    body("email", "Email is Required").isEmail(),
    body("password", "Password with 6 or more characters required").isLength({
      min: 6,
    }),
  ],
  registerController
);

// GET CURRENT LOGGED IN USER
router.get("/me", verifyToken, currentUser);

export default router;
