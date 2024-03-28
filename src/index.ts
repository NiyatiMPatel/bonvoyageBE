import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import { cloudinaryConnect } from "./config/cloudinary";
import { connectToMongo } from "./config/mongoose";
import routes from "./routes/index";

// CONNECT TO CLOUDINARY
cloudinaryConnect();
// CONNECT TO MONGODB DATABASE
connectToMongo();
// CREATE NEW EXPRESS APP
const app = express();
//ACCESS COOKIES
app.use(cookieParser());
// AUTOMATICALLY CONVERT REQ.BODY OF POST REQUEST TO JSON
app.use(express.json());
// PARSE URL TO GET URL PARAMS
app.use(express.urlencoded({ extended: true }));
// HANDLING CORS IN APP
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// INITIAL CONNECTION TEST
app.get("/api/test", async (req: Request, res: Response) => {
  res.json({
    message: "Hello from express endpoint",
  });
});

// APP ROUTES
app.use("/", routes);

app.listen(process.env.PORT, () => {
  console.log("app.listen", `Server running on localhost:${process.env.PORT}`);
});
