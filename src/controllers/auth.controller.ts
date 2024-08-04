import { Request, Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model";

// USER LOGIN CONTROLLER
export const loginController = async (req: Request, res: Response) => {
  // CHECK FOR ANY ERRORS IN THE REQUEST
  const errors = validationResult(req);
  // IF ANY ERROR IS PRESENT, SEND THAT ERROR TO THE FRONTEND AND NOT PROCEED WITH FINDING AND CREATING A USER
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array(),
    });
  }
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    // IF USER DOES NOT EXIST
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    // IF USER EXISTS - COMPARE THE PASSWORDS
    const isMatch = await bcrypt.compare(password, user.password);
    // IF PASSWORDS DO NOT MATCH
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // IF IS A VALID USER - CREATE ACCESS TOKEN AND SEND IT AS PART OF HTTP COOKIE
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1d" }
    );
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 86400000, //same as expiresIn but in milliseconds
    });

    res.status(200).send({ userId: user._id, message: "Login Successful" });
  } catch (error) {
    console.log("loginController ~ error:", error);
    res.status(500).send({
      message: "Something went wrong",
    });
  }
};

// COOKIE TOKEN VALIDATION ROUTE/ ENDPOINT
export const verifyTokenController = async (req: Request, res: Response) => {
  try {
    // SEND USER DETAIL TO THE FRONTEND AFTER VERIFYING AUTH TOKEN STORED IN COOKIE
    res.status(200).send({ userId: req.userId });
  } catch (error) {
    console.log("verifyTokenController ~ error:", error);
    res.status(500).send({
      message: "Something went wrong",
    });
  }
};

// USER LOGOUT CONTROLLER
export const logoutController = async (req: Request, res: Response) => {
  try {
    res.cookie("auth_token", "", {
      expires: new Date(0), //token expires now immidiately
    });
    res.status(200).send({
      message: "Logout Successful",
    });
  } catch (error) {
    console.log("logoutController ~ error:", error);
    res.status(500).send({
      message: "Something went wrong",
    });
  }
};
