const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

// Tiyakin na ang uploads folder ay umiiral
const ensureUploadsDirectory = () => {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log(`Created uploads directory at ${uploadsDir}`);
    }
};

ensureUploadsDirectory();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    // Pinagsamang allowed extensions at MIME types para sa documents at images
    const allowedExtensions = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|jpeg|jpg|png|gif)$/i;
    const allowedMimeTypes = /^(application|image)\/(pdf|msword|vnd\.openxmlformats-officedocument|jpeg|png|gif)/i;

    const extname = allowedExtensions.test(path.extname(file.originalname));
    const mimetype = allowedMimeTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Only document and image files are allowed."));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit
    },
});

module.exports = upload;