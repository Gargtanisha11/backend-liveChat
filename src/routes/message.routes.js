import { Router } from "express";
import { deleteMessage, getAllMessage, sendMessage } from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/authenticate.middleware.js";

const router= Router();

router.use(verifyJWT);
router.route("/getAllMessage/:chatId").get(getAllMessage);
router.route("/sendMessage/:receiverId/:chatId").post(sendMessage);
router.route("/deleteMessage/:chatId/:messageId").delete(deleteMessage);


export default router;