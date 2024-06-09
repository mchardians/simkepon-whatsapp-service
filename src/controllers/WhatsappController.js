import { whatsapp } from "../index.js";
import fs from "fs";

class WhatsappController {
    static index(req, res) {
        return res.send("Hello World!");
    }

    static getQR(req, res) {
        return res.json({
            "qr": whatsapp.getQrCode(),
        });
    }

    static async sendMessage(req, res) {
        try {
            const number = req.query.number || req.body.number;
            const message = req.query.message || req.body.message;

            const msgResponse = await whatsapp.sendMessage(number, message);   

            return res.json({
                "status": res.statusCode,
                "message": "OK",
                "data": {
                    "to": msgResponse.id.remote.user,
                    "fromMe": msgResponse.fromMe,
                    "body": msgResponse.body,
                    "success": true,
                }
            });
        } catch (error) {
            return res.json({
                "status": res.statusCode,
                "message": error.message,
                "success": false
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
                "status": res.statusCode,
                "message": "OK",
                "data": {
                    "to": msgResponse.id.remote.user,
                    "fromMe": msgResponse.fromMe,
                    "media": media,
                    "body": msgResponse.body,
                    "success": true,
                }
            });
        } catch (error) {
            return res.json({
                "status": res.statusCode,
                "message": error.message,
                "success": false
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
                "status": res.statusCode,
                "message": "OK",
                "data": msgResponse
            });   
        } catch (error) {
            return res.json({
                "status": res.statusCode,
                "message": error.message,
                "success": false
            });
        }
    }

    static logout(req, res) {
        try {
            whatsapp.logout();
            
            return res.json({
                status: res.statusCode,
                success: true,
            });
        } catch (error) {
            console.log(error);
        }
    }
}

export { WhatsappController };