import { ApiError } from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js";
import {ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
// user  controller

const registerUser = asyncHandler(async (req, res) => {
  // get the username ,full name, email,avatar image , req.body
  const { fullName, userName, email ,password } = req.body;
  if ([fullName, userName, email,password].some((field) => field.trim() === "")) {
    throw new ApiError(400, "all fields are required ");
  }

  // check if user already exist
  const isUserExist = await User.findOne({ $or: [{ userName }, { email }] });
  if(isUserExist){
       throw new ApiError(400,"user already exist")
  }
  // get the avatar imaage from req.file
  const avatar = req.files?.avatar[0]?.path;

  // check if avatar is uploaded by user or not
  if (!avatar) {
    throw new ApiError(400, " avatar image is uploaded");
  }
  // upload the avatar on cloudinary
  const avatarFilePath = await uploadOnCloudinary(avatar);
  // create the user
  if(!avatarFilePath.url){
    throw new ApiError(500,"error is this "+avatarFilePath)
  }
  const createdUser = await User.create({
    fullName,
    userName,
    email,
    password,
    avatar: avatarFilePath?.url,
  });

  if(!createdUser){
      throw new ApiError(500, "something gone wrong while creating the user");
  }
  return res.status(200).json(new ApiResponse(200,createdUser,"successfully created the user"));
});


export {registerUser}