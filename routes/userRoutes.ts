import express from "express";
import {getUserHistory, Login,Logout,SignUp, getMe} from "../controller/userController.js";
import { googleAuth } from "../controller/googleController.js";
import isAuthenticated from "../middleware/isAuth.js";
import { validate } from "../validation/validate.js";
import { LoginSchema, SignUpSchema } from "../validation/authValidation.js";
import { GlobalRateLimiter } from "../middleware/rateLimiter.js";
const router = express.Router();

router.route("/logout").post(Logout);
router.route("/google-login").post(googleAuth)
router.get("/me", isAuthenticated, getMe);
router.get("/history/:userId", getUserHistory);
router.post("/signup",GlobalRateLimiter,validate(SignUpSchema),SignUp);
router.route("/login").post(GlobalRateLimiter,validate(LoginSchema),Login);
export default router
;