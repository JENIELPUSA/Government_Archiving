const express = require('express');
const router = express.Router();//express router
const Department=require('./../Controller/DepartmentController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,Department.createDepartment)
    .get(authController.protect,Department.DisplayDepartment)

router.route('/:id')
    .patch(authController.protect,Department.UpdateDepartment)
    .delete(authController.protect,Department.deleteDepartment)


module.exports=router