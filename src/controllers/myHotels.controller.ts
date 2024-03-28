import { Request, Response } from "express";
import cloudinary from "cloudinary";
import HotelModel from "../models/hotel.model";
import { HotelType } from "../types/type";

// CREATE MY HOTELS
export const createMyHotel = async (req: Request, res: Response) => {
  try {
    // console.log("createMyHotel ~ req.files:", req.files);
    // console.log("createMyHotel ~ req.body:", req?.body);

    const reqImageFiles = req.files as Express.Multer.File[];

    const newHotel: HotelType = req.body;

    //  1. UPLOAD IMAGES TO CLOUDINARY
    const imageUrls = await uploadImages(reqImageFiles);
    // 2. IF UPLOAD WAS SUCCESSFUL, ADD URLS TO NEW HOTEL
    newHotel.imageUrls = imageUrls;
    newHotel.lastUpdated = new Date();
    newHotel.userId = req.userId;
    // 3. SAVE NEW HOTEL IN DATABASE
    const hotel = new HotelModel(newHotel);
    const savedHotel = await hotel.save();
    // RETURN 201 RESPONSE
    res.status(201).send({
      data: savedHotel,
      message: "Created new hotel Successfully",
    });
  } catch (error) {
    console.log("Error creating hotels");
    res.status(500).send({
      message: error,
    });
  }
};

// GET ALL MY HOTELS
export const readMyHotels = async (req: Request, res: Response) => {
  try {
    const hotels = await HotelModel.find({ userId: req.userId });
    res.status(200).send({
      data: hotels,
      message: "Hotels fetched Successfully",
    });
  } catch (error) {
    console.log("Error fetching hotels");
    res.status(500).send({
      message: error,
    });
  }
};

// GET SINGLE HOTEL
export const readMyHotel = async (req: Request, res: Response) => {
  try {
    const id = req.params.id.toString();
    const userId = req.userId;
    const hotel = await HotelModel.findById({
      _id: id,
      userId: userId,
    });
    res.status(200).send({
      data: hotel,
      message: "Hotel fetched Successfully",
    });
  } catch (error) {
    console.log("Error fetching hotel");
    res.status(500).send({
      message: error,
    });
  }
};

// UPDATE SINGLE HOTEL
export const updateMyHotel = async (req: Request, res: Response) => {
  try {
    const hotelId = req.params.id.toString();
    const userId = req.userId;

    const updateHotel: HotelType = req.body;

    updateHotel.lastUpdated = new Date();

    // FIND THE HOTEL FROM DATABASE TO UPDATE
    const hotel = await HotelModel.findByIdAndUpdate(
      {
        _id: hotelId,
        userId: userId,
      },
      updateHotel,
      { new: true }
    );

    if (!hotel) {
      return res.status(400).send({
        message: "No hotel found",
      });
    }
    // HANDLE CHANGES IN IMAGE
    const reqImageFiles = req.files as Express.Multer.File[]; //NEW IMAGES UPLOADED
    const newImageUrls = await uploadImages(reqImageFiles);

    // STORE NEW IMAGES URL + OLD ALTERED IMAGES URL - AS, USER CAN DELETE IMAGES AND SEND THE REMAINING IMAGE URL
    hotel.imageUrls = [...newImageUrls, ...(updateHotel.imageUrls || [])];

    // SAVE THE IMAGE CHANGES TO ABOUVE UPDATED HOTE
    await hotel.save();

    // RETURN 201 RESPONSE
    res.status(201).send({
      data: hotel,
      message: "Updated hotel Successfully",
    });
  } catch (error) {
    console.log("Error updating hotel");
    res.status(500).send({
      message: error,
    });
  }
};

// HEPLER FUNCTION FOR IMAGE UPLOAD
async function uploadImages(imageFiles: Express.Multer.File[]) {
  const uploadPromises = imageFiles?.map(async (image) => {
    const b64 = Buffer.from(image.buffer).toString("base64");
    let dataURI = "data:" + image.mimetype + ";base64," + b64;
    const res = await cloudinary.v2.uploader.upload(dataURI);
    return res.url;
  });

  const imageUrls = await Promise.all(uploadPromises);
  return imageUrls;
}
