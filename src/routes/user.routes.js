import e from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = e.Router();

router.route("/register").post(registerUser)

export default router;