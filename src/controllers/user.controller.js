import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {apiResponse} from "../utils/apiResponse.js";
import generateAccessAndRefreshToken from "../utils/generateAccessAndRefreshToken.js";


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

const loginUser = asyncHandler(async (req, res) =>{
  const {email, username, password} = req.body

  if(!username && !email){
    throw new apiError(300, "username or email is required")
  }

  const user = await User.findOne({
    $or: [{username}, {email}]
  });

  if(!user){
    throw new apiError(300, "no such user exist");
  }

  const passwordValid = await user.isPasswordCorrect(password);
  if(!passwordValid){
    throw new apiError(300, "incorrect password");
  }
  console.log(user._id);
  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
  
  const cookieOptions = {httpOnly : true , secure : true};

  return res.status(200)
  .cookie("AccessToken", accessToken, cookieOptions)
  .cookie("RefreshToken", refreshToken, cookieOptions)
  .json(new apiResponse(200, {user:loggedInUser, accessToken, refreshToken}, "logged in successfully"));

})

const logoutUser = asyncHandler(async (req, res) =>{

  await User.findByIdAndUpdate(req.user._id, {
    $unset: {refreshToken: 1}
  },{
    new: true
  });

  const cookieOptions = {httpOnly : true , secure : true};

  return res.status(200)
  .clearCookie("accessToken", cookieOptions)
  .clearCookie("refreshToken", cookieOptions)
  .json(new apiResponse(200, {}, "logged out successfully"))
  

})

const newAccessTokenGeneration = asyncHandler(async (req, res)=>{
  const {newAccessToken, newRefreshToken} = generateAccessAndRefreshToken(req.user._id);

  const Options = {
    httpOnly: true,
    secure: true
  }
  res.status(200)
  .cookie("AccessToken", newAccessToken, Options)
  .cookie("RefreshToken", newRefreshToken, Options)
  .json(new apiResponse(200,{newAccessToken, newRefreshToken}, "session reset complete"))

})


export { registerUser , loginUser, logoutUser, newAccessTokenGeneration}