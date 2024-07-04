const express = require( "express" );
const { editDp, editProfile } = require( "../controllers/merchantController" );
const router = express.Router();


router.route( '/:id' )
      .post( editDp )
      .put(editProfile)

module.exports = router;