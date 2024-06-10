const { Router } = require("express");
const {
  addToCart,
  removeFromCart,
  changeQuantity,
  getCart,
  // emptyCart,
} = require("../controllers/cartController.js");

const router = Router();

router.post("/", addToCart);

router.get("/", getCart);

router.delete("/:id", removeFromCart);
// router.delete("/", emptyCart);

router.put("/:id", changeQuantity);

module.exports = router;
