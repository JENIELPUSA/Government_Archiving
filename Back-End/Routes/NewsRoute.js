const express = require("express");
const router = express.Router(); 
const NewsController = require("../Controller/newsController");
const authController = require("./../Controller/authController");
const upload = require("../middleware/imageUploader");
router
  .route("/")
  .get(NewsController.DisplayNews)
  .post(authController.protect,upload.single("avatar"), NewsController.AddNews);
router
  .route("/:id")
  .delete(authController.protect, NewsController.deleteNews)
  .patch(
    authController.protect,
    upload.single("avatar"),
    NewsController.UpdateNews
  );


module.exports = router;
