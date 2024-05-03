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
    // console.log(
    //   "file is successfully uploaded on cloudinary",
    //   cloudinaryResponse.url
    // );
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file
    return cloudinaryResponse;
  } catch (error) {
    // fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the uploaded operation got failed
    return null;
  }
};

// delete file from cloudinary
const deleteFileCloudinary = async (_id, resource_type= "image") => {
  try {
    if (!_id) return null;
    // delete the file on cloudinary
    const cloudinaryResponse = await cloudinary.uploader.destroy(_id, {
      resource_type : `${resource_type}`,
    });
    // file is successfully deleted from cloudinary
    console.log("file is successfully deleted from cloudinary", cloudinaryResponse);
  } catch (error) {
    console.log("Error in deleting file from cloudinary", error);
    return error;
  }
}

export {uploadFileCloudinary, deleteFileCloudinary}