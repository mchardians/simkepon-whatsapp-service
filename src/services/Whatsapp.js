import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const { Client, LocalAuth, MessageMedia } = pkg;
const wwebVersion = '2.2412.54';

class Whatsapp {

    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            dataPath: "./auth_sessions",
            webVersionCache: {
                type: 'remote',
                remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
            } 
        });

        this.client.on('ready', () => {
            console.log('Client is ready!');
        });

        this.client.on("qr", qr => {
            this.qr = qr;

            qrcode.generate(qr, { small: true });
        });

        this.start();
    }

    getQrCode() {
        return this.qr;
    }

    start() {
        this.client.initialize();
    }

    async sendMessage(number, message) {
        try {
            let formattedNumber = null;

            if(number.startsWith('0')) {
                formattedNumber = `${number.replace('0', '62')}@c.us`;
            }else if(number.startsWith('62')) {
                formattedNumber = `${number}@c.us`;
            }

            const isExists = await this.client.isRegisteredUser(formattedNumber);

            if(!isExists) {
                throw new Error("User is not registered");
            }
            
            return this.client.sendMessage(formattedNumber, message);
        } catch (error) {
            console.log(`Error in sendMessage: ${error.message}`);

            throw error;
        }
    }

    async sendMedia(number, message, media) {
        try {
            let formattedNumber = null;

            if(number.startsWith('0')) {
                formattedNumber = `${number.replace('0', '62')}@c.us`;
            }else if(number.startsWith('62')) {
                formattedNumber = `${number}@c.us`;
            }

            const isExists = await this.client.isRegisteredUser(formattedNumber);

            if(!isExists) {
                throw new Error("User is not registered");
            }

            media = MessageMedia.fromFilePath(media);

            return this.client.sendMessage(formattedNumber, media, {
                sendMediaAsDocument: true,
                caption: message
            });
        } catch (error) {
            console.log(`Error in sendMedia: ${error.message}`);
            
            throw error;
        }
    }

    async sendBulkMessage(numbers, message) {
        try {
            let responses = [];
            let formattedNumber = null;
            let index = 0;

            const promise = new Promise((resolve, reject) => {
                const interval = setInterval( async () => {
                    if(numbers[index] === undefined) {

                        clearInterval(interval);

                        return resolve({
                            "message": message,
                            "data": responses
                        });
                    }

                    if(numbers[index].startsWith('0')) {
                        formattedNumber = `${numbers[index].replace('0', '62')}@c.us`;
                    }else if(numbers[index].startsWith('62')) {
                        formattedNumber = `${numbers[index]}@c.us`;
                    }

                    const isExists = await this.client.isRegisteredUser(formattedNumber);

                    if(!isExists) {
                        responses.push({
                            "number": numbers[index],
                            "status": "failed",
                            "isExists": isExists,
                            "error": "User is not registered"
                        });

                        return index++;
                    }

                    const msgResponse = await this.client.sendMessage(formattedNumber, message);

                    responses.push({
                        "id": msgResponse.id,
                        "status": "success",
                        "body": msgResponse.body,
                        "from": msgResponse.from,
                        "to": msgResponse.to
                    });

                    console.log(`Sending message to ${numbers[index]}, isExist: ${isExists}`);

                    index++;
                }, 10000);
            });
            
            return await promise;
        } catch (error) {
            console.log(`Error in sendBulkMessage: ${error.message}`);
            
            throw error;
        }
    }
}

export default Whatsapp;