import express from "express";
import { param } from "express-validator";
import {
  fetchHotels,
  getSearch,
  getsearchedHotel,
  paymentIntent,
} from "../controllers/hotel.controller";
import verifyToken from "../middleware/auth.middleware";
import { createBooking } from "../controllers/booking.controller";

const router = express.Router();

router.get("/", fetchHotels);

// GET SEARCH
router.get("/search", getSearch);

// GET SINGLE HOTEL
router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Hotel ID is required")],
  getsearchedHotel
);

// BOOKING INTENTENT ENDPOINT
router.post("/:hotelId/bookings", verifyToken, createBooking);

// STRIPE ENDPOINT - POST
router.post("/:hotelId/bookings/payment-intent", verifyToken, paymentIntent);

export default router;
