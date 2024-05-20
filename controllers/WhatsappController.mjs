import { whatsapp } from "../index.mjs";

class WhatsappController {
    static index(req, res) {
        res.send("Hello World!");
    }

    static getQR(req, res) {
        res.send(whatsapp.getQrCode());
    }

    static async sendMessage(req, res) {
        const number = req.query.number || req.body.number;
        const message = req.query.message || req.body.message;

        try {
            const msgResponse = await whatsapp.sendMessage(number, message);   

            res.json({
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
            res.json({
                status: res.statusCode,
                message: error.message
            });
        }
    }
}

export { WhatsappController };