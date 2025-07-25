
const express = require("express");
const router = express.Router();//express router
const AdminController=require('../Controller/AdminController')
const authController = require('./../Controller/authController')
router.route('/')
    .get(authController.protect,AdminController.DisplayAdmin)


router.route('/:id')
    .delete(authController.protect,AdminController.deleteAdmin)
    .patch(authController.protect,AdminController.UpdateAdmin)




module.exports = router;