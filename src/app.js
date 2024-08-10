import e from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = e()

app.use(cors({
  origin: process.env.CORS_ORIGIN
}))

app.use(e.json({limit: "16kb"}))
app.use(e.urlencoded())
app.use(e.static("public"))
app.use(cookieParser())

//importing routes
import userRouter from "./routes/user.routes";
app.use("/api/v1/users", userRouter);


export {app}