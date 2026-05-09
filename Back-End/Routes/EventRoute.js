const express = require('express');
const router = express.Router();//express router
const EventController=require('./../Controller/EventController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,EventController.createEvent)
    .get(EventController.DisplayEvent)

router.route('/currentmonth')
    .get(EventController.DisplayEventbymonth)

router.route('/:id')
    .patch(authController.protect,EventController.UpdateEvent)
    .delete(authController.protect,EventController.deleteEvent)


module.exports=router