const express = require('express');
const router = express.Router();//express router
const CategoryFile=require('./../Controller/CategoryController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,CategoryFile.createCategory)
    .get(authController.protect,CategoryFile.DisplayCategory)

router.route('/:id')
    .patch(authController.protect,CategoryFile.UpdateCategory)
    .delete(authController.protect,CategoryFile.deleteCategory)


module.exports=router