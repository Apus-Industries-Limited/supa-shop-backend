const express = require( "express" );
const {logout, logoutMerchant} = require( "../controllers/logoutController" );
const router = express.Router();

router.get( '/', logout )
router.get('/merchant', logoutMerchant)

module.exports = router