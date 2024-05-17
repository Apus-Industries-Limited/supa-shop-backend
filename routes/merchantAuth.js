const express = require( "express" );
const {
createMerchant,
loginMerchant,
forgotMerchantPassword,
resetMerchantPassword
} = require("../controllers/merchantController");
const { verificationMerchantMail, verifyMerchantCode } = require( "../controllers/verificationController" );

const router = express.Router();


router.post( '/register', createMerchant )
router.post( '/login', loginMerchant )
router.post( '/forgot-password', forgotMerchantPassword )
router.post( '/reset-password', resetMerchantPassword )
router.get( '/verify-mail/:email', verificationMerchantMail )
router.post('/verify-mail', verifyMerchantCode)

module.exports = router;