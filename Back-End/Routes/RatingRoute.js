const express = require('express');
const router = express.Router();//express router
const RatingsController=require('./../Controller/RatingController')


router.route('/')
    .post(RatingsController.addRating)
router.route('/:documentId')
    .get(RatingsController.getRatingSummary);


module.exports=router