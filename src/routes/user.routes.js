import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  changeOldPassword,
  updateAccountDetails,
  getChatList,
  getUserDetails,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/authenticate.middleware.js";
//registerUser, loginUser, logoutUser, changeOldPassword,updateAccountDetails,getUserDetails,getChatList
const router = Router();
router
  .route("/register")
  .post(upload.fields([{ name: "avatar", maxCount: 1 }]), registerUser);

router.route("/loginUser").post(loginUser);
router.route("/logoutUser").post(verifyJWT, logoutUser);
router.route("/changeOldPassword").post(verifyJWT, changeOldPassword);
router.route("/updateAccountDetails").post(verifyJWT,upload.fields([{name:"avatar", maxCount :1}]), updateAccountDetails);
router.route("/getUserDetails").get(verifyJWT, getUserDetails);
router.route("/getChatList").get(verifyJWT, getChatList);
export default router;
