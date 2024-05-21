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
}

export default Whatsapp;