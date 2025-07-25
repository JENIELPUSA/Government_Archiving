const express = require('express');
const router = express.Router();//express router
const DentalHistory=require('./../Controller/Dental_HistoryController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,DentalHistory.createHistory)
    .get(authController.protect,DentalHistory.DisplayHistory)

router.route('/:id')
    .patch(authController.protect,DentalHistory.UpdateHistory)
    .delete(authController.protect,DentalHistory.deleteHistory)
    


module.exports=router