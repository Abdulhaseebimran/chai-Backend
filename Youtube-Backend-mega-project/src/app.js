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


export { app }