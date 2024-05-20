import express from "express";
import { WhatsappController } from "../controllers/WhatsappController.mjs";

const router = express.Router();

router.get("/", WhatsappController.index);

router.get("/qr", WhatsappController.getQR);

router.post("/send-message", WhatsappController.sendMessage);

export default router;