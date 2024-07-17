import mongoose, { Mongoose } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import fs from "fs";
import cookieParser from "cookie-parser";
import { option } from "../constant.js";
// user  controller
const generateAccessAndRefreshToken = async (user_id) => {
  try {
    const user = await User.findById(user_id);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: true });
    return { accessToken, refreshToken };
  } catch (error) {
    return error;
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get the username ,full name, email,avatar image , req.body
  const { fullName, userName, email, password } = req.body;
  if (
    [fullName, userName, email, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(401, "all fields are required ");
  }

  // check if user already exist
  const isUserExist = await User.findOne({ $or: [{ userName }, { email }] });
  if (isUserExist) {
    fs.unlinkSync(req.files?.avatar[0]?.path);
    throw new ApiError(400, "user already exist");
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
  if (!avatarFilePath.url) {
    throw new ApiError(500, "error is this " + avatarFilePath);
  }
  const createdUser = await User.create({
    fullName,
    userName,
    email,
    password,
    avatar: avatarFilePath?.url,
  });

  if (!createdUser) {
    throw new ApiError(500, "something gone wrong while creating the user");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "successfully created the user"));
});

const loginUser = asyncHandler(async (req, res) => {
  // get the user name or email and password
  // chcek if user exist with email or username
  // verify the password
  // generate access token and refresh token
  // send cookie

  const { userName, email, password } = req.body;
  if (!(userName || email)) {
    throw new ApiError(401, " userName or email is required ");
  }
  if (!password) {
    throw new ApiError(402, " password is required ");
  }
  const user = await User.findOne({ $or: [{ email }, { userName }] });
  if (!user) {
    throw new ApiError(400, " User doesn't exist ");
  }
  const isPasswordCorrect = await user.verifyPassword(password);
  if (!isPasswordCorrect) {
    throw new ApiError(402, " password is not correct");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loginUser = await User.findById(user._id).select(
    " -refreshToken -password"
  );

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, option)
    .cookie(" accessToken ", accessToken, option)
    .json(new ApiResponse(200, loginUser, " User is successFully loggedIn"));

  // return to set the cookie
});

const logoutUser = asyncHandler(async (req, res) => {
  // for loggedOut  first we are using middleware(verifyJwt) in its route to check if user id logged out or not
  // then we will delete the refreshToken from userdata and clear cookie
  const { _id } = req.user;
  const user = await User.findByIdAndUpdate(
    _id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );
  console.log(user);

  return res
    .status(200)
    .clearCookie("refreshToken", option)
    .clearCookie("accessToken", option)
    .json(new ApiResponse(200, user, "successfully logged out"));
});

const changeOldPassword = asyncHandler(async (req, res) => {
  // check if authenticate user or not (this will done using middleware)
  // verify old password
  // take the user id from req.user and change its password and save the user and return the  user details
  const { password, oldPassword } = req.body;
  if (password && oldPassword) {
    throw new ApiError(401, " password and new  password  are required ");
  }

  const isCorrectPassword = await user.verifyPassword(oldPassword);
  if (!isCorrectPassword) {
    throw new ApiError(402, "incorrect password ");
  }

  const { _id } = req.user;
  const user = await User.findByIdAndUpdate(
    _id,
    {
      $set: {
        password: password,
      },
    },
    { new: true }
  );
  if (!user) {
    throw new ApiError(401, " not able to update the password ");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, [], " password chaange successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { userName, fullName } = req.body;
  const avatar = req.files.avatar[0].path;

  if (!(userName || (fullName || avatar))) {
    throw new ApiError(402, " username or fullName is required  ");
  }

  const { _id } = req.user;
  const user = await User.findById(_id);
  if (userName) {
    user.userName = userName;
  }
  if (fullName) {
    user.fullName = fullName;
  }
  if (avatar) {
    const avatarFilePath = await uploadOnCloudinary(avatar);
    if (!avatarFilePath.url) {
      throw new ApiError(
        501,
        "unable to upload on cloudinary and error is " + avatarFilePath
      );
    }

    const oldAvatarFileUrl = user.avatar;
    user.avatar = avatarFilePath.url;
    const isDeletedFromCloudinary =
      await deleteFromCloudinary(oldAvatarFileUrl);
    if (!isDeletedFromCloudinary) {
      throw new ApiError(501, "not able to delete the file from cloudinary");
    }
  }

  user.save({ validateBeforeSave: true });
  const updatedUser = await User.findById(_id);
  console.log(updatedUser);
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, " successfully updated user details")
    );
});

const getUserDetails =asyncHandler(async(req,res)=>{
   const user =req.user;
   return res.status(200).json(new ApiResponse(200,user," successfully fetch user details"));
})

const getChatList =asyncHandler(async(req,res)=>{
    // get the user id 
    // get the chat id from ChatList  and then find that ids from chatmodel and send the useful fields 

    const {_id} = req.user;
    const chatList= await User.aggregate([
      {
        $match:{
          _id: new mongoose.Types.ObjectId(_id)
        }
      },
      {
        $lookup:{
          from:"chats",
          localField:"chatList",
          foreignField:"_id",
          as:"chatLists"
        }

      },
    ]);

    if(!chatList.length==0){
      throw new ApiError(502, " not able to get the chat lists");
    }

    return res.status(200).json (new ApiError(200, chatList," successfully fetch the chat list"));
})


// user controller - change password, ,updateAccountDetails( userName, avatar) get user details,get chatList
export { registerUser, loginUser, logoutUser, changeOldPassword,updateAccountDetails,getUserDetails,getChatList };
