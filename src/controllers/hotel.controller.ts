import { Request, Response } from "express";
import { validationResult } from "express-validator";
import HotelModel from "../models/hotel.model";
import Stripe from "stripe";
import { HotelSearchResponse } from "../types/type";

const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

// FETCH HOTELS
export const fetchHotels = async (req: Request, res: Response) => {
  try {
    const hotels = await HotelModel.find().sort("-lastUpdated");
    res
      .status(200)
      .send({ data: hotels, message: "Fetched Hotels Successfully" });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({ message: "Error fetching hotels" });
  }
};

//GET ALL SEARCHED HOTELS
export const getSearch = async (req: Request, res: Response) => {
  try {
    const query = constructSearchQuery(req.query);

    let sortOptions = {};
    switch (req.query.sortOption) {
      case "starRating":
        sortOptions = { starRating: -1 }; // STAR RATING HIGH TO LOW - DESCENDING
        break;
      case "pricePerNightAsc":
        sortOptions = { pricePerNight: 1 }; // PRICE LOW TO HIGH - ASCENDING
        break;
      case "pricePerNightDesc":
        sortOptions = { pricePerNight: -1 }; // PRICE HIGH TO LOW - DESCENDING
        break;
    }

    // ADD PAGINATION - NO. OF HOTELS PER PAGE - FOR THIS WE NEED PAGE NO. FROM THE FRONTEND - THIS PAGE NO. WILL BE PART OF REQ
    const pageSize = 5;
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1"
    );
    //PAGE SKIP - EG. IF USER WANTS TO GO TO PAGE 3 SKIP 2 PAGES AND SHOW RESULTS FROM HOTEL NO. 11 TO 15 ON PAGE 3
    const skip = (pageNumber - 1) * pageSize;

    // SEARCH/GET HOTELS BASED ON QUERY, SORT, FILTER, PAGINATION
    const hotels = await HotelModel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    // PAGINATED HOTEL RESULT
    const total = await HotelModel.countDocuments(query); //TOTAL NUMBER OF HOTELS IN DB
    // OVERAL SEARCH RESULT BASED ON QUERY, SORT, FILTER, PAGINATION
    const response: HotelSearchResponse = {
      data: hotels,
      pagination: {
        total,
        currentPage: pageNumber,
        totalPages: Math.ceil(total / pageSize),
      },
    };
    // SEND THE RESPONSE
    res.status(200).send({
      data: response,
      message: "Hotels fetched Successfully",
    });
  } catch (error) {
    console.log("getSearch ~ error:", error);
    res.status(500).send({
      message: "Something went wrong",
    });
  }
};

// GET A SINGLE HOTEL
export const getsearchedHotel = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    return res.status(400).send({ errors: errors.array });
  }
  try {
    const id = req.params.id.toString();
    const hotel = await HotelModel.findById(id);
    res.status(200).send({
      data: hotel,
      message: "Fetched hotel Successfuly",
    });
  } catch (error) {
    console.log("getsearchedHotel ~ error:", error);
    res.status(500).send({
      message: "Something went wrong",
    });
  }
};

// STRIPE ENDPOINT - POST
export const paymentIntent = async (req: Request, res: Response) => {
  try {
    // 1. TOTAL COST OF THIS BOOKING -> TOTAL NO. OF NIGHTS
    // 2. HOTELID TO BIND PAYMENT INTENT TO THAT HOTEL
    // 3. USERID OF USER WHO IS CREATING THIS BOOKING TO BIND TO PAYMENT INTENT

    const { numberOfNights } = req.body;
    const hotelId = req.params.hotelId;
    const userId = req.userId;
    const hotel = await HotelModel.findById(hotelId);
    if (!hotel) {
      return res.status(400).send({ message: "Hotel not found" });
    }
    const totalCost = hotel.pricePerNight * numberOfNights;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCost * 100,
      currency: "cad",
      metadata: {
        hotelId,
        userId,
      },
    });

    if (!paymentIntent.client_secret) {
      return res.status(500).send({ message: "Error creating payment intent" });
    }

    const response = {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret.toString(),
      totalCost,
    };
    res.send({
      data: response,
      message: "Payment intent created successfully",
    });
  } catch (error) {
    console.log("paymentIntent ~ error:", error);
    res.status(500).send({
      message: "Something went wrong",
    });
  }
};

// HELPER FUNCTION
const constructSearchQuery = (queryParams: any) => {
  let constructedQuery: any = {};

  // SEARCH BY EITHER CITY OR COUNTRY, CASE INSENSITIVE
  if (queryParams.destination) {
    constructedQuery.$or = [
      { city: new RegExp(queryParams.destination, "i") },
      { country: new RegExp(queryParams.destination, "i") },
    ];
  }
  // SEARCH BY ADULT COUNT GREATER THAN OR EQUAL TO
  if (queryParams.adultCount) {
    constructedQuery.adultCount = {
      $gte: parseInt(queryParams.adultCount),
    };
  }
  // SEARCH BY CHILD COUNT GREATE THAN OR EQUAL TO
  if (queryParams.childCount) {
    constructedQuery.childCount = {
      $gte: parseInt(queryParams.childCount),
    };
  }
  // SEARCH BY ALL FACILITIES CHECKED
  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities) // A HOTEL HAS MANY FACILITIES; RETURN ALL HOTELS THAT HAVE ALL THE FACILITIES RECEIVED IN QUERY PARAMS
        ? queryParams.facilities // 1 FACILITY IN QUERY PARAMS
        : [queryParams.facilities], // MORE THAN 1 FACILITIES IN QUERY PARAMS
    };
  }
  // SEARCH BY TYPES INCLUDED
  if (queryParams.types) {
    constructedQuery.type = {
      $in: Array.isArray(queryParams.types) // A HOTEL HAS ONLY 1 TYPE; RETURN ANY HOTELS THAT HAVE TYPES = TYPE RECEIVED IN QUERY PARAMS
        ? queryParams.types // 1 TYPE IN QUERY PARAM
        : [queryParams.types], // MORE THAN 1 TYPES IN QUERY PARAMS
    };
  }
  // SEARCH BY STAR RATINGS INCLUDED
  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star: string) => parseInt(star)) // CONVERT THE ARRAY OF STRINGS TO ARRAY OF NUMBERS
      : parseInt(queryParams.stars);

    constructedQuery.starRating = { $in: starRatings };
  }
  // SEARCH BY PRICE PER NIGHT LESS THAN EQUAL TO
  if (queryParams.maxPrice) {
    constructedQuery.pricePerNight = {
      $lte: parseInt(queryParams.maxPrice).toString(),
    };
  }

  return constructedQuery;
};
