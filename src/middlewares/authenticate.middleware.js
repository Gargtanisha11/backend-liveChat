// create a function verifyJwt that verify the refreshtoken is valid or not
// steps to do the same
// take the refreshToken from cookie or from header and decode it and find the user id
//  then find the user with that user id if user exist then set req.user= user and call next()
// if doesn't exist then throw an error

import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer", "").trim();
  console.log(accessToken);
  //console.log(req.cookies.accessToken);
    if (!accessToken) {
    throw new ApiError(401, " unauthorized access");
  }
  try {
    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const { _id } = decodedToken;
    if (!_id) {
      throw new ApiError(400, " unauthorized access");
    }
    const user = await User.findById(_id).select("-password");
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(
      501,
      " something went wrong while verifying the user  the Error is : " + error
    );
  }
});
