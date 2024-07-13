const express = require( "express" );
const { deleteMerchant, updateMerchantPassword, editMerchantProfile, uploadMerchantDp } = require( "../controllers/merchantProfile" );
const router = express.Router();


router.route( '/' )
      .delete( deleteMerchant )
      .put( updateMerchantPassword )
      .patch( editMerchantProfile );
      
router.route( '/dp' )
      .post( uploadMerchantDp );

module.exports = router;