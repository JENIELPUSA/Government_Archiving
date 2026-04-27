const express = require('express');
const router = express.Router();//express router
const CommentController=require('./../Controller/CommentController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(CommentController.createComment)
    .get(CommentController.getCommentsByPdfId)
router.route('/allComments')
.get(authController.protect,CommentController.DisplayAllComponents)

router.route('/getComments')
    .post(CommentController.getCommentsByPdfId);
router.route('/:id')
    .patch(authController.protect,CommentController.UpdateStatus);

module.exports=router