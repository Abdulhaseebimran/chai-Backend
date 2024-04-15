import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express.json({limit: "16KB"})); // limit the size of the request body to 16KB
app.use(express.urlencoded({ extended: true })); // parse the URL-encoded data with the querystring library
app.use(cookieParser());

// import routes

import userRouter from "./routes/user.routes.js";

// routes declearation

app.use("/api/v1/users", userRouter); // middleware for the user routes


export { app }