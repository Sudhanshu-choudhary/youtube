import { User } from "../models/user.models.js";
import { apiError } from "./apiError.js";

// async function generateAccessAndRefreshToken(userid){
//   try {
//     const user = await User.findById(userid);
//     const accessToken = await user.generateAccessToken();
//     const refreshToken = await user.generateRefreshToken();
//     user.refreshToken = refreshToken;
//     await user.save({validateBeforeSave: false});

//     return {accessToken, refreshToken}
//   } 

//   catch (err) {
//     throw new apiError(400, "generation failed");
//   }

// }

//export {generateAccessAndRefreshToken};

const generateAccessAndRefreshToken = async(userId) =>{
  try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {accessToken, refreshToken}


  } catch (error) {
      throw new apiError(500, "Something went wrong while generating referesh and access token")
  }
}

export default generateAccessAndRefreshToken