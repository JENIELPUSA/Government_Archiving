const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
 const allowedExts = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|jpg|jpeg|png|gif|svg|webp)$/i;
  
  if (!allowedExts.test(path.extname(file.originalname).toLowerCase())) {
    return cb(new Error("Only document and image files are allowed (.pdf, .docx, .jpg, .png, etc)"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = upload;
