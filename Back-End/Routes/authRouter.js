const express = require("express");
const authController = require("../Controller/authController");
const router = express.Router();
const upload = require("../middleware/fileUploader");
router.route("/signup").post(upload.single("avatar"), authController.signup);

router.route("/login").post(authController.login);

router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);

router.route("/mail-verification").post(authController.verifyOtp);

router
  .route("/DisplayProfile")
  .get(authController.protect, authController.DisplayProfile);

router
  .route("/updatePassword")
  .patch(authController.protect, authController.updatePassword);

router
  .route("/UpdateAvatar")
  .patch(authController.protect,upload.single("avatar"), authController.UpdateAvatar);
router
  .route("/UpdateProfileInfo")
  .patch(authController.protect, authController.UpdateProfileInfo);


  

module.exports = router;
