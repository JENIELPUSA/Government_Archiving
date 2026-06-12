const express = require("express");
const router = express.Router();
const upload = require("../middleware/imagemultiplearry"); // no destructure
const LandingPageController = require("../Controller/LandingPageController");
const authController = require("../Controller/authController");
router.get("/", LandingPageController.DisplayLandingPage);
router.post(
    "/",
    authController.protect,
    upload.array("image", 10),
    LandingPageController.saveLandingPage
);

module.exports = router;