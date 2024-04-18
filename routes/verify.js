const express = require("express");
const {
  verificationMail,
  verifyCode,
} = require("../controllers/verificationController");

const router = express.Router();

router.get("/:email", verificationMail);
router.post("/", verifyCode);

module.exports = router;

