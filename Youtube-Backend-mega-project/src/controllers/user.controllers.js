import e from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadFileCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get the user details form frontend
  // validation - not null
  // check if user already exists - email, username
  // check for image, check for avatar
  // upload the image to cloudinary, avatar
  // create a user object - crate entry to db
  // remove the password, refresh token field from the response
  // check for user creation
  // return the response

  const { firstName, username, email, password } = req.body;
  console.log(firstName, username, email, password); // check the data is coming or not

  if (
    [firstName, username, email, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All field is required");
  } else if (email.includes("@") === false) {
    throw new ApiError(400, "Invalid email");
  }

  // check if user already exists - email, username
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(
      400,
      "User is already exists with this email or username"
    );
  }

  // check for image, check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  // upload the image to cloudinary, avatar

  const avatar = await uploadFileCloudinary(avatarLocalPath);
  const coverImage = await uploadFileCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar image upload failed");
  }

  // create a user object - crate entry to db

  const user = await User.create({
    firstName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", // not optional in db schema
    username: username.toLowerCase(),
    email,
    password,
  });

  // check for user creation
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User registration failed!");
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

export { registerUser };
