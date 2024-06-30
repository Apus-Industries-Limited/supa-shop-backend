const express = require( "express" );
const { refresh, merchantRefresh, cleanUp } = require( "../controllers/refreshController" );
const router = express.Router();


router.get( '/', refresh )
router.get('/merchant', merchantRefresh)

module.exports = {router,cleanUp}