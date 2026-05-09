const express = require("express");
const router = express.Router();
const upload = require("../middleware/imagemultiplearry"); // no destructure
const LandingPageController = require("../Controller/LandingPageController");
const authController = require("../Controller/authController");
router.get("/", LandingPageController.DisplayLandingPage);
router.post(
    "/",
    authController.protect,
    upload.array("avatar", 10), // multiple files, max 10
    LandingPageController.saveLandingPage
);

module.exports = router;