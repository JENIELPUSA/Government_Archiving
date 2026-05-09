const express = require('express');
const router = express.Router();//express router
const InsuranceController=require('./../Controller/InsuranceController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,InsuranceController.createIsnurance)
    .get(authController.protect,InsuranceController.DisplayInsurance)

router.route('/:id')
    .patch(authController.protect,InsuranceController.UpdateInsurance)
    .delete(authController.protect,InsuranceController.deleteInsurance)
   
module.exports=router