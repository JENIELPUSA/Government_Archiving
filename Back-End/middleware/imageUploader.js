const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Tiyakin ang tamang path para sa uploads folder
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

const ensureUploadsDirectory = () => {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log(`Created uploads directory at ${uploadsDir}`);
    }
};

ensureUploadsDirectory();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Gumawa ng dynamic subfolder para sa bawat category ID
        const categoryId = req.body.category;
        
        if (!categoryId) {
            return cb(new Error("Category ID is missing."));
        }

        // Ang subfolder ay direktang nasa loob ng uploads folder
        const subfolder = path.join(uploadsDir, categoryId.toString());
        
        if (!fs.existsSync(subfolder)) {
            fs.mkdirSync(subfolder, { recursive: true });
            console.log(`Created subfolder at ${subfolder}`);
        }
        cb(null, subfolder);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, JPG, PNG are allowed"));
    }
};

const uploadImages = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, 
    },
});

module.exports = uploadImages;