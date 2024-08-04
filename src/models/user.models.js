import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    required: true
  },
  coverImage: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  },
  watchHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video"
  }]

}, {timestamps: true})

userSchema.pre("save", function(next){
  if(this.isModified("password")){
    this.password = bcrypt.hash(this.password, 8)
    next()
  }})

userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
  return jwt.sign({
    _id: this._id,
    username: this.username
  }),
  process.env.ACCESS_TOKEN,
  {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  }
}


userSchema.methods.generateRefreshToken = function(){
  return jwt.sign({
    _id: this._id
  }),
  process.env.REFRESH_TOKEN,
  {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
  }
}



export const User = mongoose.model('User', userSchema)