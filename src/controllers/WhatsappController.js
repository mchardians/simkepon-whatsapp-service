import { whatsapp } from "../index.js";
import fs from "fs";

class WhatsappController {
    static index(req, res) {
        return res.send("Hello World!");
    }

    static getQR(req, res) {
        return res.send(whatsapp.getQrCode());
    }

    static async sendMessage(req, res) {
        try {
            const number = req.query.number || req.body.number;
            const message = req.query.message || req.body.message;

            const msgResponse = await whatsapp.sendMessage(number, message);   

            return res.json({
                status: res.statusCode,
                message: "success",
                data: {
                    "id": msgResponse.id,
                    "body": msgResponse.body,
                    "from": msgResponse.from,
                    "to": msgResponse.to,
                }
            });
        } catch (error) {
            return res.json({
                error: true,
                message: error.message
            });
        }
    }

    static async sendMedia(req, res) {
        try {
            const number = req.query.number || req.body.number;
            const message = req.query.message || req.body.message;
            const media = req.file;

            if(media.mimetype !== "application/pdf") {
               throw new Error("Only PDF files are allowed"); 
            }

            const msgResponse = await whatsapp.sendMedia(number, message, media.path);

            return res.json({
                status: res.statusCode,
                message: "success",
                data: {
                    "id": msgResponse.id,
                    "media": media,
                    "body": msgResponse.body,
                    "from": msgResponse.from,
                    "to": msgResponse.to,
                }
            });
        } catch (error) {
            return res.json({
                error: true,
                message: error.message
            });
        } finally {
            fs.unlinkSync(req.file.path);
        }
    }

    static async sendBulkMessage(req, res) {
        try {
            const numbers = req.query.numbers || req.body.numbers;
            const message = req.query.message || req.body.message;

            const msgResponse = await whatsapp.sendBulkMessage(numbers, message);

            return res.json({
                status: res.statusCode,
                success: true,
                "response": msgResponse
            });   
        } catch (error) {
            return res.json({
                error: true,
                message: error.message
            });
        }
    }
}

export { WhatsappController };