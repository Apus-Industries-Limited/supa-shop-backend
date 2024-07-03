const { Router } = require("express");
const {
  getProductById,
  listProducts,
  listcategory,
  getProductByCategory,
  searchFilter,
  cleanUp,
} = require("../controllers/productController.js");

const router = Router();

router.get("/", listProducts);
router.get("/category", listcategory);
router.get("/category/product", getProductByCategory);
router.get("/search", searchFilter);
router.get("/:id", getProductById);

module.exports = {router,cleanUp};
