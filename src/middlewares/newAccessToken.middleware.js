import { User } from "../models/user.models.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const newAccessToken = asyncHandler(async (req, _, next)=>{
  try {
    const incomingRefreshtoken = req.cookies?.RefreshToken || req.body?.RefreshToken ;
  
    if(!incomingRefreshtoken){
      throw new apiError(401, "you dont have a refresh token ");
    }
  
    const decodedRefreshToken = jwt.verify(incomingRefreshtoken, process.env.REFRESH_TOKEN);
    const user = await User.findById(decodedRefreshToken?._id);
  
    if(!user){
      throw new apiError(401, "invalid refresh token");
    }
  
    if(incomingRefreshtoken != user?.RefreshToken){
      throw new apiError(401, "invalid access from user")
    }
  
    req.user = user; 
    next();
  } catch (error) {
    throw new apiError(401, error?.message)
  }
  })