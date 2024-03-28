import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// EXTENDING REQUEST TYPE TO ADD CUSTOM USERID PROPERTY ON REQUEST
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies["auth_token"];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized Request" });
  }
  // IF TOKEN IS AVAILABLE, VERIFY IT IS VALID
  try {
    //DECODE THE TOKEN AND GET USERid FROM DECODED TOKEN
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
    // ADDING CUSTOM USERID PROPERTY ON REQ, THEREFORE NEED TO EXTEND REQUEST TYPE
    req.userId = (decoded as JwtPayload).userId;
    next();
  } catch (error) {
    console.log("verifyToken ~ error:", error);
    return res.status(401).json({ message: "Unauthorized Request" });
  }
};

export default verifyToken;
