import { Request, Response } from "express";
import UserModel from "../models/user.model";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

// USER REGISTRATION CONTROLLER
export const registerController = async (req: Request, res: Response) => {
  // GET ANY ERRORS THAT EXPRESS-VALIDATOR HAS PICKED UP AND ATTACHED TO REQUEST
  const errors = validationResult(req);
  // IF ANY ERROR IS PRESENT, SEND THAT ERROR TO THE FRONTEND AND NOT PROCEED WITH FINDING AND CREATING A USER
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array(),
    });
  }
  try {
    const { email } = req.body;
    // CHECK IF USER ALREADY EXISTS BASED ON EMAIL
    let user = await UserModel.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    user = new UserModel(req.body);
    const savedUser = await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1d" }
    );
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000, //same as expiresIn but in milliseconds
    });

    // return res.sendStatus(200); //NO RESPONSE BODY AS WE ARE SENDING COOKIE AND IT AUTOMATICALLY GETS SET IN THE BROWSER FOR US. THEREFORE WE DO NOT HAVE TO WRITE ANY CODE ON THE FRONTEND TO HANDLE THIS
    res.status(200).send({
      data: savedUser,
      message: "User registered successfully",
    });
  } catch (error) {
    console.log("registerController ~ error:", error);
    res.status(500).send({
      message: "Something went wrong",
    });
  }
};

//GET CURRENT LOGGED IN USER
export const currentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }
    return res.status(200).send({
      data: user,
      message: "Fetched user Successfully",
    });
  } catch (error) {
    console.log("currentUser ~ error:", error);
    res.status(500).send({
      message: "Something went wrong",
    });
  }
};
