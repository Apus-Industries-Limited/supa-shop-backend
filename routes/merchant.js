const { Router } = require( "express" );

const {
  createProduct,
  deleteProduct,
  updateProduct,
  getMerchantProduct,
  getSingleProductMerchant,
} = require( "../controllers/productController.js" );

const router = Router();
router.route( '/' )
      .post( createProduct )
      .get( getMerchantProduct )

router.route( '/:id' )
      .put( updateProduct )
      .delete( deleteProduct )
      .get( getSingleProductMerchant )


module.exports = router;