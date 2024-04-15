import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFileCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload the file on cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file is successfully uploaded on cloudinary
    console.log(
      "file is successfully uploaded on cloudinary",
      cloudinaryResponse.url
    );
    return cloudinaryResponse;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the uploaded operation got failed
    return null;
  }
};

export {uploadFileCloudinary}