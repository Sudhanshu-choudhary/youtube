import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {apiResponse} from "../utils/apiResponse.js";


const registerUser = asyncHandler(async (req, res) =>{

  const {fullname, email, username, password} = req.body
  console.log(email, password);


  //validations
  if(
    [fullname, username, password, email].some((field)=> field?.trim() == "")
    ){
      throw new apiError(404, `${field} is required`);
  }

  const existedUser = await User.findOne({
    $or: [{username}, {email}]
  })

  if(existedUser){
    throw new apiError(404, `username or email exists already`)
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  
  if(!avatarLocalPath){
    throw new apiError(404, "avatar path is must ");
  }

  const avatar =await uploadOnCloudinary(avatarLocalPath);
  const coverImage =await uploadOnCloudinary(coverImageLocalPath);
  

  if(!avatar){
    throw new apiError(404, "avatar file is required ");
  }
  
  const user = await User.create({
    fullname,
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