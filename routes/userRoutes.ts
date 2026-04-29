import express from "express";
import {getUserHistory, Login,Logout,SignUp, getMe} from "../controller/userController.js";
import { googleAuth } from "../controller/googleController.js";
import isAuthenticated from "../middleware/isAuth.js";

const router = express.Router();

router.route("/signup").post(SignUp);
router.route("/login").post(Login);
router.route("/logout").post(Logout);
router.route("/google-login").post(googleAuth)
router.get("/me", isAuthenticated, getMe);
router.get("/history/:userId", getUserHistory);
export default router
;