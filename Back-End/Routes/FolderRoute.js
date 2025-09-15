const express = require('express');
const router = express.Router();//express router
const Folder=require('./../Controller/FolderController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,Folder.createFolder)
    .get(authController.protect,Folder.DisplayFolder)

router.route('/:id')
    .patch(authController.protect,Folder.UpdateFolder)
    .delete(authController.protect,Folder.deleteFolder)

router.route('/getFilesByFolderId/:id')
    .get(authController.protect,Folder.getFilesByFolderId)

router.route('/getUploadedCategoriesByFolderId/:id')
    .get(authController.protect,Folder.getUploadedCategoriesByFolderId)


module.exports=router