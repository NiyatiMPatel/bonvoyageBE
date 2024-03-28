import express from "express";
import { body } from "express-validator";
import {
  createMyHotel,
  readMyHotel,
  readMyHotels,
  updateMyHotel,
} from "../controllers/myHotels.controller";
import verifyToken from "../middleware/auth.middleware";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// CREATE MY HOTEL
router.post(
  "/",
  verifyToken,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("type").notEmpty().withMessage("Hotel type is required"),
    body("pricePerNight")
      .notEmpty()
      .isNumeric()
      .withMessage("Price per night is required and must be a number"),
    body("facilities")
      .notEmpty()
      .isArray()
      .withMessage("Facilities are required"),
  ],
  upload.array("imageFiles", 6),
  createMyHotel
);

// GET ALL MY HOTEL
router.get("/", verifyToken, readMyHotels);

// GET SINGLE HOTEL
router.get("/:id", verifyToken, readMyHotel);

// UPDATE SINGLE HOTEL
router.put("/:id", verifyToken, upload.array("imageFiles"), updateMyHotel);

export default router;
