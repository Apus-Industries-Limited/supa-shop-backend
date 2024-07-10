const express = require( "express" );
const { getAllAddress, editAddress, addAddress, deleteAddress, deleteAllAddress } = require( "../controllers/userProfileController" );
const { uploadDp, editProfile, deleteDp, deleteAccount, updatePassword } = require( "../controllers/userProfileController" );
const router = express.Router();

router.route( '/' )
      .delete( deleteAccount )
      .put( updatePassword )
      .patch( editProfile )

router.route( '/dp' )
      .post( uploadDp )
      .delete(deleteDp)

router.route( '/address' )
      .get( getAllAddress )
      .put( editAddress )
      .post( addAddress )
      .delete( deleteAllAddress );

router.delete('/address/:id',deleteAddress)
module.exports = router;