const express = require( "express" );
const { addToWishlist, getWishlist, removeWishlist, removeAllWishlist } = require( "../controllers/wishlistController" );
const router = express.Router();


router.post( "/", addToWishlist )
router.get('/:id', getWishlist)
router.delete( '/:id', removeWishlist )
router.delete("/",removeAllWishlist)

module.exports =router