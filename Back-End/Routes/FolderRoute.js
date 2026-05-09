const express = require('express');
const router = express.Router();//express router
const Folder = require('./../Controller/FolderController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect, Folder.createFolder)
    .get(authController.protect, Folder.DisplayFolder)

router.route('/:id')
    .patch(authController.protect, Folder.UpdateFolder)
    .delete(authController.protect, Folder.deleteFolder)

router.route('/getFilesByFolderId/:id')
    .get(authController.protect, Folder.getFilesByFolderId)

router.route('/getUploadedCategoriesByFolderId/:id')
    .get(authController.protect, Folder.getUploadedCategoriesByFolderId)
router.route('/getUniqueTagsByFolderId/:id')
    .get(authController.protect, Folder.getUniqueTagsByFolderId)
router.route('/getAllFiles')
    .get(authController.protect, Folder.getAllFiles)

router.route('/getTags')
    .get(authController.protect, Folder.getTags)


module.exports = router