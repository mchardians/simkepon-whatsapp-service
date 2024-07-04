import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { Client, LocalAuth, MessageMedia } = pkg;

class Whatsapp {

    constructor(io) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const SESSION_FILE_PATH = path.resolve(__dirname, './auth_sessions');

        if(!fs.existsSync(SESSION_FILE_PATH)) {
            fs.mkdirSync(SESSION_FILE_PATH, { recursive: true });
        }

        this.io = io;
        this.state = "UNPAIRED";

        this.client = new Client({
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            },
            authStrategy: new LocalAuth({
                dataPath: SESSION_FILE_PATH,
            }),
            webVersionCache: {
                type: 'none',
            }, 
        });

        this.client.on('ready', () => {
            console.log('Client is ready!');
        });

        this.client.on("qr", qr => {
            this.qr = qr;
            this.state = "UNPAIRED_IDLE";

            qrcode.generate(qr, { small: true });

            io.emit('qr', this.qr);
            io.emit('change_state', this.getState());
        });

        this.client.on('authenticated', () => {
            this.state = "PAIRED";

            io.emit('change_state', this.getState());
        });

        io.on('connection', (socket) => {
            console.log('a user connected');

            socket.on('start', () => {
                this.start();

                console.log("Starting...");

                io.emit('qr', this.qr);
                io.emit('change_state', this.getState());
            });
        
            socket.on('disconnect', () => {
              console.log('user disconnected');
            });

            socket.on('logout', async() => {
                console.log("Signed out and stopped...");
                await this.logout();
                await this.client.destroy();
            });
        });
    }

    getQrCode() {
        return this.qr;
    }

    getState() {
        return this.state;
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

            const promise = new Promise((resolve) => {
                const interval = setInterval( async () => {
                    if(numbers[index] === undefined) {

                        clearInterval(interval);

                        return resolve(responses);
                    }

                    if(numbers[index].startsWith('0')) {
                        formattedNumber = `${numbers[index].replace('0', '62')}@c.us`;
                    }else if(numbers[index].startsWith('62')) {
                        formattedNumber = `${numbers[index]}@c.us`;
                    }

                    const isExists = await this.client.isRegisteredUser(formattedNumber);

                    if(!isExists) {
                        responses.push({
                            "to": numbers[index],
                            "isExists": isExists,
                            "isSend": false,
                            "success": false,
                            "reason": "User is not registered"
                        });

                        return index++;
                    }

                    const msgResponse = await this.client.sendMessage(formattedNumber, message);

                    responses.push({
                        "to": msgResponse.id.remote.user,
                        "isExists": isExists,
                        "isSend": true,
                        "fromMe": msgResponse.fromMe,
                        "body": msgResponse.body,
                        "success": true,
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

    async logout() {
        try {
            await this.client.logout();
            await this.client.destroy();

            return true;
        }catch(error) {
            console.log(`Error in logout: ${error.message}`);
            throw error;
        }finally {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            await fs.promises.rm(path.resolve(__dirname, './public/temp'), { recursive: true, force: true });

            console.log("Logged out");
        }
    }
}

export default Whatsapp;