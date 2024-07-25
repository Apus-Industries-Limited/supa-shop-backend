const express = require( "express" );
const { getStores, getStoreProduct, getSingleStore, getFeatureStores, getStoreCategory } = require( "../controllers/storeController" );
const router = express.Router();

router.get( "/", getStores );
router.get( '/product', getStoreProduct );
router.get( '/feature', getFeatureStores )
router.get( "/category", getStoreCategory );
router.get( "/:id", getSingleStore );

module.exports =router