var express = require("express");
var router = express.Router();

// Require controllers
var row_controller = require("../controllers/rowController");

// GET post listing page
router.get("/", row_controller.index);

// POST request for marking "X" or "O"
router.post("/mark", row_controller.mark);

// POST request for reseting the table
router.post("/reset", row_controller.clearFill);

module.exports = router;
