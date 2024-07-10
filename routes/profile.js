const express = require( "express" );
const {  } = require( "../controllers/userProfileController" );
const { uploadDp, editProfile, deleteDp, deleteAccount, updatePassword } = require( "../controllers/userProfileController" );
const router = express.Router();

router.route( '/' )
      .delete( deleteAccount )
      .put(updatePassword)

router.route( '/:id' )
      .post( uploadDp )
      .put( editProfile )
      .delete(deleteDp)

module.exports = router;