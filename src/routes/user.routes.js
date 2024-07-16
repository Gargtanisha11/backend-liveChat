import { Router } from "express";
import {registerUser,loginUser, logoutUser} from  "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/authenticate.middleware.js";

const router= Router();
router.route("/register").post(upload.fields([
    {name:"avatar", maxCount:1}
]),registerUser);

router.route("/loginUser").post(loginUser);
router.route("/logoutUser").post(verifyJWT,logoutUser);
export default router;

