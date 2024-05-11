import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadFileCloudinary,
  deleteFileCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const pipeline = [];

  if (query) {
    pipeline.push({
      $search: {
        index: "searchVideos",
        text: {
          query: query,
          path: ["title", "description"], // search in title and description fields
        },
      },
    });
  }
  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user id");
    }
  }

  pipeline.push({
    $match: {
      user: mongoose.Types.ObjectId(userId),
    },
  });

  // fetch videos only that are set isPublished as true
  pipeline.push({
    $match: {
      isPublished: true,
    },
  });

  // sortBy can be views, createdAt durantion
  // sortType can be ascending(-1) or descending(1)
  if (sortBy && sortType) {
    pipeline.push({
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1, // 1 for ascending, -1 for descending
      },
    });
  } else {
    pipeline.push({
      $sort: {
        createdAt: -1, // default sort by createdAt in descending order
      },
    });
  }

  // pagination logic using skip and limit pipeline stages
  // page starts from 1
  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              "avatar.url": 1,
            },
          },
        ],
      },
    },
    { $unwind: "$ownerDetails" } // destructure ownerDetails array
  );

  const videoAggreate = await Video.aggregate(pipeline);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const videos = await Video.aggregatePaginate(videoAggreate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  // check if title and description is provided
  if (["title", "description"].some((field) => field.trim() === "")) {
    throw new ApiError(400, "Please provide title and description");
  }

  if (!req.user?._id) {
    throw new ApiError(400, "You are not authorized to publish video");
  }

  const videoLocalPath = req.file?.videoFile[0].path;
  const thumbnailLocalPath = req.file?.thumbnail[0].path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Please provide video file");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Please provide thumbnail file");
  }

  // upload video and thumbnail to cloudinary
  const videoFile = await uploadFileCloudinary(videoLocalPath, "video");
  const thumbnail = await uploadFileCloudinary(thumbnailLocalPath);

  if (!videoFile && !thumbnail) {
    throw new ApiError(500, "Failed to upload video and thumbnail");
  }

  const createVideo = await Video.create({
    title: title?.trim(),
    description: description?.trim(),
    duration: videoFile.duration,
    videoFile: {
      url: videoFile.url,
      publicId: videoFile.publicId,
    },
    thumbnail: {
      url: thumbnail.url,
      publicId: thumbnail.publicId,
    },
    owner: req.user?._id,
    isPublished: true,
  });

  const videoUploaded = await Video.findById(createVideo._id);

  if (!videoUploaded) {
    throw new ApiError(500, "Failed to publish video");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, videoUploaded, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id provided"); // check if videoId is valid ObjectId
  }

  if (!isValidObjectId(!req.user?._id)) {
    throw new ApiError(400, "You are not authorized to view this video");
  }

  const videoAggreate = await Video.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        form: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $project: {
              "owner.avatar_url": 1,
              "owner.username": 1,
              content: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addfields: {
              subscribersCount: { $size: "$subscribers" },
              isSubscribed: {
                $cond: {
                  $if: {
                    $in: [
                      mongoose.Types.ObjectId(req.user?._id),
                      "$subscribers.subscriber",
                    ],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              username: 1,
              "avatar.url": 1,
              subscribersCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likeCount: { $size: "$likes" },
        owner: { $first: "$owner" },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        "videoFile.url": 1,
        title: 1,
        description: 1,
        views: 1,
        createdAt: 1,
        duration: 1,
        comments: "$comments",
        owner: 1,
        likesCount: 1,
        isLiked: 1,
        "thumbnail.url": 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, videoAggreate, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnai
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id provided");
  }

  if (!(title && description)) {
    throw new ApiError(400, "Please provide title and description");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  // delete previous thumbnail and upload new thumbnail
  const thumbnailToDelete = video.thumbnail.public_id;
  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const thumbnail = await uploadFileCloudinary(thumbnailLocalPath);

  if (!thumbnail) {
    throw new ApiError(500, "Failed to upload thumbnail");
  }

  // update video details
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title?.toString()?.trim(),
        description: description?.toString()?.trim(),
        thumbnail: {
          public_id: thumbnail.public_id,
          url: thumbnail.url,
        },
      },
    },
    { new: true }
  );

  if (!updatedVideo) {
    throw new ApiError(500, "Failed to update video");
  }

  if (thumbnailToDelete) {
    await deleteFileCloudinary(thumbnailToDelete);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id provided");
  }

  const videoDetails = await Video.findById(videoId);

  if (!videoDetails) {
    throw new ApiError(404, "Video not found");
  }

  if (videoDetails.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  const result = await Video.findByIdAndDelete(videoDetails?._id);

  if (!result) {
    throw new ApiError(500, "Failed to delete video");
  }

  if (videoDetails.videoFile.public_id && videoDetails.thumbnail.public_id) {
    await deleteFileCloudinary(videoDetails.videoFile.public_id);
    await deleteFileCloudinary(videoDetails.thumbnail.public_id);
  }

  // Delete all comments and likes associated with the video
  await Comment.deleteMany({ video: videoDetails._id });
  await Like.deleteMany({ video: videoDetails._id });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id provided");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      400,
      "You can't toogle publish status as you are not the owner"
    );
  }

  const toggleVideoPublish = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video?.isPublished,
      },
    },
    { new: true }
  );

  if (!toggleVideoPublish) {
    throw new ApiError(500, "Failed to toggle publish status");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        toggleVideoPublish,
        "Video publish status toggled successfully"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
