import e from "express";
import { loginUser, logoutUser, newAccessTokenGeneration, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import  {verifyJWT}  from "../middlewares/auth.middleware.js";
import { newAccessToken } from "../middlewares/newAccessToken.middleware.js";

const router = e.Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    },
    {
      name: "coverImage",
      maxCount: 1
    }
  ]),
  registerUser
)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/newToken-generation").post(newAccessToken, newAccessTokenGeneration)

export default router;