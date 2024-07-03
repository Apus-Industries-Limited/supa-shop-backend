const express = require( "express" );
const { getStores, getStoreProduct, getSingleStore, getFeatureStores, getStoreCategory } = require( "../controllers/storeController" );
const router = express.Router();

router.get( "/", getStores );
router.get( '/product', getStoreProduct );
router.get( "/:id", getSingleStore );
router.get( '/feature', getFeatureStores )
router.get("/category",getStoreCategory)

module.exports =router