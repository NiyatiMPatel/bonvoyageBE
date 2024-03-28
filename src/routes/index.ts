import express from "express";
import userRouter from "./users.router";
import authRouter from "./auth.router";
import myHotelsRouter from "./myHotels.router";
import hotelsRouter from "./hotel.router";
import myBookingRouter from "./myBookings.router";

const router = express.Router();
// USER REGISTRATION ROUTE
router.use("/api/users", userRouter);

// USER LOGIN ROUTE
router.use("/api/auth", authRouter);
export default router;

// MY HOTELS ROUTE - ADMINS
router.use("/api/my-hotels", myHotelsRouter);

// SEARCH HOTELS ROUTE - BROWSING VIEWERS
router.use("/api/hotels", hotelsRouter);

// MY BOOKING ROUTES
router.use("/api/my-bookings", myBookingRouter);
