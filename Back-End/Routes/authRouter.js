const express = require('express');
const authController = require('../Controller/authController');
const router = express.Router();

router.route('/signup')
.post(authController.signup);

router.route('/login')
.post(authController.login);

router.route('/forgotPassword').post(
    authController.forgotPassword
);
router.route('/resetPassword/:token')
.patch(authController.resetPassword)


router.route('/mail-verification')
.post(authController.verifyOtp)

router.route('/updatePassword')
.patch(authController.protect,authController.updatePassword)

module.exports = router;
