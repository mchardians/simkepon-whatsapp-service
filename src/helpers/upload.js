import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        if(!fs.existsSync("./public/temp")) {
            await fs.promises.mkdir("./public/temp", { recursive: true });
        }

        cb(null, "./public/temp/");
    },
    filename: function (req, file, cb) {
        let ext = file.originalname.substring(
           file.originalname.lastIndexOf('.'), 
           file.originalname.length
        );
        cb(null, Date.now() + ext);
    },
});

const upload = multer({ 
    storage: storage
});

export { upload };