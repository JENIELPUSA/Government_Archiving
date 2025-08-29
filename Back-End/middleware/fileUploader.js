const multer = require("multer");
const path = require("path");

// Disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // siguraduhing may uploads folder
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const cleanName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${timestamp}-${cleanName}`);
  },
});

// File type validation
const fileFilter = (req, file, cb) => {
  const allowedExts = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|jpg|jpeg|png|gif|svg|webp)$/i;

  if (!allowedExts.test(path.extname(file.originalname).toLowerCase())) {
    return cb(new Error("Only document and image files are allowed (.pdf, .docx, .jpg, .png, etc)"));
  }
  cb(null, true);
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 40 * 1024 * 1024 }, // 40MB
});

module.exports = upload;
