const { Router } = require("express");
const {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} = require("../controllers/productController.js");
const { verifyMerchant, verifyJwt } = require("../middleware/auth.js");

const router = Router();

router.post("/create", [verifyJwt, verifyMerchant], createProduct);

router.put("/update/:id", [verifyJwt, verifyMerchant], updateProduct);

router.delete("/delete/:id", [verifyJwt, verifyMerchant], deleteProduct);

router.get("/", [verifyJwt], listProducts);

router.get("/:id", [verifyJwt], getProductById);

module.exports = router;
