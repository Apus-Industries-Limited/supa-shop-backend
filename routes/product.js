const { Router } = require("express");
const {
  getProductById,
  listProducts,
  listcategory,
  getProducByCategory,
  searchFilter,
} = require("../controllers/productController.js");

const router = Router();

router.get( "/", listProducts );
router.get( "/categories", listcategory )
router.get( '/category', getProducByCategory )
router.get('/search',searchFilter)
router.get("/:id", getProductById);

module.exports = router;
