import express from "express";
import router from "./routes/api.js";
import Whatsapp from "./services/Whatsapp.js";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const port = 3000;
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/', router);
app.use(express.static("public"));

const whatsapp = new Whatsapp(io);

server.listen(port, () => console.log(`App listening on http://localhost:${port}`));

export { whatsapp }