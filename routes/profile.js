const express = require( "express" );
const { uploadDp, editProfile } = require( "../controllers/authController" );
const router = express.Router();

router.route( '/:id' )
      .post( uploadDp )
      .put( editProfile )

module.exports=router