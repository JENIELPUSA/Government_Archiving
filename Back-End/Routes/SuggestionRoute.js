const express = require('express');
const router = express.Router();//express router
const SuggestionController = require('./../Controller/SuggestionController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(SuggestionController.createSuggestion)
    .get(authController.protect,SuggestionController.getAllSuggestions)

router.route('/:id')
    .patch(authController.protect, SuggestionController.updateSuggestion)
    .delete(authController.protect, SuggestionController.deleteSuggestion)


module.exports = router