const express = require("express");
const router = express.Router(); //express router
const SBmemberController = require("../Controller/SbController");
const authController = require("./../Controller/authController");
const upload = require("../middleware/imageUploader");
router
  .route("/")
  .get(SBmemberController.DisplaySBmember)
  .post(authController.protect, SBmemberController.createSBmember);
router
  .route("/:id")
  .delete(authController.protect, SBmemberController.deleteSBmember)
  .patch(
    authController.protect,
    upload.single("avatar"),
    SBmemberController.UpdateSBmember
  );


module.exports = router;
