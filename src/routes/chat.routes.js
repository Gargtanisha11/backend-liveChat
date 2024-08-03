import { Router } from "express";
import { verifyJWT } from "../middlewares/authenticate.middleware.js";
import { getAllMessage } from "../controllers/message.controller.js";
import { createOrGetChat, deleteChat, getAllChats } from "../controllers/chat.controller.js";

 const router =Router();

 router.use(verifyJWT);
router.route("/getAllchat/").get(getAllChats);
router.route("/createChat/:receiverId").post(createOrGetChat);
router.route("/deleteChat/:chatId").delete(deleteChat);


export default router;