import mongoose from "mongoose";
import {DB_NAME} from "../constants.js" 

async function connectDB(){
  try {
    const connectionObj = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    console.log(connectionObj.connection.host);
    console.log("mongodb conneted")
  } catch (error) {
    console.log("something went wrong")
    process.exit(1);
  }
  
}

export default connectDB