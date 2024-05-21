import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
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