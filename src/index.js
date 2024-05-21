import express from "express";
import router from "./routes/api.js";
import Whatsapp from "./services/whatsapp.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);
app.use(express.static("public"));

const whatsapp = new Whatsapp();

app.listen(port, () => console.log(`App listening on http://127.0.0.1:${port}`));

export { whatsapp }