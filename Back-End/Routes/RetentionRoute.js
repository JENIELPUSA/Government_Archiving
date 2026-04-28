const express = require('express');
const router = express.Router();//express router
const Retention=require('./../Controller/retentioController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,Retention.setRetentionAndArchiveOldFiles)
    .get(authController.protect,Retention.DisplayRetention)

module.exports=router