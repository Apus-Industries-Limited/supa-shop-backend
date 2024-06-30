const { Router } = require( "express" );

const {
  createProduct,
  deleteProduct,
  updateProduct,
  getMerchantProduct,
  getSingleProductMerchant,
  uploadDp,
  uploadPicture,
  deletePicture,
  cleanUp,
} = require( "../controllers/productController.js" );

const router = Router();
router.route( '/' )
      .post( createProduct )
      .get( getMerchantProduct )

router.route( '/upload' )
      .post( uploadPicture )

router.route( '/upload/:id' )
      .delete(deletePicture)

router.route( '/:id' )
      .post(uploadDp)
      .put( updateProduct )
      .delete( deleteProduct )
      .get( getSingleProductMerchant )


module.exports = {router,cleanUp};