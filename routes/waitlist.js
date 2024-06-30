const express = require("express");
const { joinWaitlist } = require("../controllers/waitlistController");
const { cleanUp } = require( "../controllers/verificationController" );
const router = express.Router();

router.post("/", joinWaitlist);

module.exports = {router,cleanUp};
