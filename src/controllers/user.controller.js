import { ApiError } from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js";
import {ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs"
import cookieParser from "cookie-parser";
import { option } from "../constant.js";
// user  controller
 const generateAccessAndRefreshToken=async(user_id)=>{

  try {
    const user = await User.findById(user_id);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
     user.refreshToken =refreshToken;
     await user.save ({validateBeforeSave:true})
     return { accessToken, refreshToken };

  } catch (error) {
      return error
  }
 }

const registerUser = asyncHandler(async (req, res) => {
  // get the username ,full name, email,avatar image , req.body
  const { fullName, userName, email ,password } = req.body;
  if (
    [fullName, userName, email,password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(401, "all fields are required ");
  }

  // check if user already exist
  const isUserExist = await User.findOne({ $or: [{ userName }, { email }] });
  if(isUserExist){
      fs.unlinkSync(req.files?.avatar[0]?.path)
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
    avatar: avatarFilePath?.url
  });

  if(!createdUser){
      throw new ApiError(500, "something gone wrong while creating the user");
  }
  return res.status(200).json(new ApiResponse(200,createdUser,"successfully created the user"));
});

const loginUser= asyncHandler(async(req,res) => {
    // get the user name or email and password 
    // chcek if user exist with email or username 
    // verify the password 
    // generate access token and refresh token 
    // send cookie 

    const {userName,email, password}= req.body
    if(! (userName || email)){
      throw new ApiError(401," userName or email is required ");
     }
     if(!password){
      throw new ApiError(402," password is required ");
     }
    const user= await User.findOne({$or:[{email},{userName}]})
    if(! user ){
      throw new ApiError(400, " User doesn't exist ")
    }  
    const isPasswordCorrect= await  user.verifyPassword(password)
    if(!isPasswordCorrect){
      throw new ApiError(402," password is not correct")
    }
   const {accessToken,refreshToken }= await generateAccessAndRefreshToken(user._id);
    const loginUser= await User.findById(user._id).select(" -refreshToken -password");
  
    return res.status(200).
    cookie("refreshToken",refreshToken ,option ).
    cookie(" accessToken ",accessToken,option). 
    json (new ApiResponse(200,loginUser," User is successFully loggedIn"));

    // return to set the cookie 
  });


export {registerUser,loginUser}