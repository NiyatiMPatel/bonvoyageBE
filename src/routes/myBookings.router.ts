import express from "express";
import verifyToken from "../middleware/auth.middleware";
import { getMyBookings } from "../controllers/booking.controller";

const router = express.Router();

router.get("/", verifyToken, getMyBookings);

export default router;
