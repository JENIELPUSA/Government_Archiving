const express = require("express");
const router = express.Router();
const authController = require('./../Controller/authController')

const VisitorController = require("../Controller/VisitorController");

router.route("/")
    .get(VisitorController.getVisitorCount);

router.route("/getgraph")
    .get(authController.protect, VisitorController.getVisitorGraph);

module.exports = router;