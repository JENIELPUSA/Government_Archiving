
const express = require("express");
const router = express.Router();//express router
const PatientController=require('../Controller/OfficerController')
const authController = require('./../Controller/authController')
router.route('/')
    .get(PatientController.DisplayOfficer)

router.route('/:id')
.patch(authController.protect,PatientController.UpdateOfficer)
    .delete(authController.protect,PatientController.deleteOfficer)


module.exports = router;