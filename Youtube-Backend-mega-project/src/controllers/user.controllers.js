import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadFileCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken; // save the refresh token in db
    await user.save({ validityBeforeSave: false }); // koi bhi validation nahi chahiye
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Somthing went wrong! while generating token");
  }
};

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

  const { fullname, username, email, password } = req.body;
  // console.log(req.body); // check the data is coming or not
  // console.log(fullname, username, email, password); // check the data is coming or not

  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All field is required");
  } else if (email.includes("@") === false) {
    throw new ApiError(400, "Invalid email");
  }

  // check if user already exists - email, username
  const existedUser = await User.findOne({
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
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // console.log("req files", req.files);

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

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
    fullname,
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

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// login user

const loginUser = asyncHandler(async (req, res) => {
  // req.body - data le kar aayega
  // email, username
  // find the user
  // password check
  // generate access and refresh token
  // send into secure cookies

  const { email, password, username } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")
  // }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // password check
  // const isPasswordValid = await user.isPasswordCorrect(password);
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // generate access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // send into secure cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

// logout user

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logout Successfully"));
});

//  Refresh Token Access

const refreshAccessToken = asyncHandler(async (req, res) => {
  const inCompleteRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!inCompleteRefreshToken) {
    throw new ApiError(401, "unauthorized access request");
  }

  try {
    // verify tokens
    const decodedToken = jwt.verify(
      inCompleteRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // find the user
    const user = User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(404, "Invalid Refresh Token");
    }

    // check the refresh token is same or not
    if (inCompleteRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Token Refreshed Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
