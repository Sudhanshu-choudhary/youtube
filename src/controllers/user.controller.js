import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {apiResponse} from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) =>{
  res.status(200).json({
    message: "ok"
  })

  const {fullName, email, username, password} = req.body
  console.log(email, password);


  //validations
  if(
    [fullName, username, password, email].some((field)=> field?.trim() == "")
    ){
      throw new apiError(404, `${field} is required`);
  }

  const existedUser = User.findOne({
    $or: [{username}, {email}]
  })

  if(existedUser){
    throw new apiError(404, `username or email exists already`)
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  
  if(!avatarLocalPath){
    throw new apiError(404, "avatar is must ");
  }

  const avatar =await uploadOnCloudinary(avatarLocalPath);
  const coverImage =await uploadOnCloudinary(coverImageLocalPath);

  if(!avatar){
    throw new apiError(404, "avatar is must ");
  }
  
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select("-password -refreshToken")

  if(!createdUser){
    throw new apiError(500, "something went wrong");
  }

  return res.status(201).json(
    new apiResponse(200, createdUser, "user registered successfully")
  )

})

export { registerUser }