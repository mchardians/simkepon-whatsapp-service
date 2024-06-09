import express from "express";
import { WhatsappController } from "../controllers/WhatsappController.js";
import { upload } from "../helpers/upload.js";

const router = express.Router();

router.get("/", WhatsappController.index);

router.get("/qr", WhatsappController.getQR);

router.post("/send-message", WhatsappController.sendMessage);

router.post("/send-media", upload.single("media"), WhatsappController.sendMedia);

router.post("/send-bulk-message", WhatsappController.sendBulkMessage);

router.post("/logout", WhatsappController.logout);

export default router;