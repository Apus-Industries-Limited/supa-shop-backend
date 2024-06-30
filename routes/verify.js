const express = require("express");
const {
  verificationMail,
  verifyCode,
  cleanUp,
} = require("../controllers/verificationController");

const router = express.Router();

router.get("/:email", verificationMail);
router.post("/", verifyCode);

module.exports = {router, cleanUp};

