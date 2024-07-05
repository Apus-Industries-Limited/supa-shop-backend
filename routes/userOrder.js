const express = require( "express" );
const { createOrder, getUserOrder } = require( "../controllers/userOrderController" );
const router = express.Router();


router.route( '/' )
      .post( createOrder )
      .get(getUserOrder)

module.exports = router;