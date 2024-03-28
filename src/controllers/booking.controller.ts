import { Request, Response } from "express";
import Stripe from "stripe";
import { BookingType, HotelType } from "../types/type";
import HotelModel from "../models/hotel.model";

// Create a new instance of the Stripe class with the provided API key
const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

export const createBooking = async (req: Request, res: Response) => {
  try {
    //CHECK IF STRIPE PAYMENT WAS SUCCESSFULL AND PAYMENT HAS BEEN MADE

    // Retrieve the payment intent ID from the request body
    const paymentIntentId = req.body.paymentIntentId;
    // Retrieve the payment intent/invoice details from Stripe using the ID
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId as string
    );

    // Check if the payment intent exists
    if (!paymentIntent) {
      return res.status(400).send({ message: "payment intent not found" });
    }

    // Check if the hotelId and userId in the payment intent metadata match the request parameters
    if (
      paymentIntent.metadata.hotelId !== req.params.hotelId ||
      paymentIntent.metadata.userId !== req.userId
    ) {
      return res.status(400).send({
        message: "Payment intent mismatch",
      });
    }

    // Check if the payment intent status is 'succeeded'
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).send({
        message: `Payment intent not succeeded. Statue:${paymentIntent.status}`,
      });
    }

    // Create a new booking object with user ID and other details from the request body
    const newBooking: BookingType = {
      ...req.body,
      userId: req.userId,
    };

    // Find and update the hotel document with the new booking
    const hotel = await HotelModel.findOneAndUpdate(
      { _id: req.params.hotelId },
      { $push: { bookings: newBooking } }
    );

    // Check if the hotel document exists
    if (!hotel) {
      return res.status(400).send({ message: "Hotel not found" });
    }
    // Save the updated hotel document and send response
    await hotel.save();
    res.status(200).send({ data: hotel, message: "Booking done Successfully" });
  } catch (error) {
    console.log("createBooking ~ error:", error);
    res.status(500).send({
      message: "Something went wrong",
    });
  }
};

// GET MY BOOKINGS
export const getMyBookings = async (req: Request, res: Response) => {
  try {
    //FIND ALL HOTELS THAT HAS BOOKING FOR CURRENTLY LOGGED IN USER
    const hotels = await HotelModel.find({
      bookings: { $elemMatch: { userId: req.userId } },
    });

    const results = hotels.map((hotel) => {
      const userBookings = hotel.bookings.filter(
        (booking) => booking.userId === req.userId
      );
      const hotelWithUserBookings: HotelType = {
        ...hotel.toObject(),
        bookings: userBookings,
      };
      return hotelWithUserBookings;
    });

    res.status(200).send({
      data: results,
      message: "Fetched bookings successfully",
    });
  } catch (error) {
    console.log("getMyBookings ~ error:", error);
    res.status(500).send({
      message: "Something went wrong",
    });
  }
};
