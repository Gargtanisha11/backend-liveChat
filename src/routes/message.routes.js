import { Router } from "express";
import { deleteMessage, getAllMessage, sendMessage } from "../controllers/message.controller";
import { verifyJWT } from "../middlewares/authenticate.middleware";

const router= Router();

router.use(verifyJWT);
router.route("/getAllMessage/:chatId").get(getAllMessage);
router.route("/sendMessage/:senderId/:chatId").post(sendMessage);
router.route("/deleteMessage/:chatId/:messageId").delete(deleteMessage);


export default router;