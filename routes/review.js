const express = require( "express" );
const {  addProductReview, deleteProductReview, addStoreReview, deleteStoreReview } = require( "../controllers/reviewController" );
const router = express.Router();

router.route( '/' )
      .post( addProductReview )
      .delete( deleteProductReview )
      
router.route( '/store' )
      .post( addStoreReview )
      .delete(deleteStoreReview)

module.exports= router