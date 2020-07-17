var express = require("express");
var router = express.Router(); // Now disabled

/* GET home page. */ 
router.get("/", function(req, res, next) {
  // res.render("index", { title: "Tic Tac an Toe!" });
  res.redirect("/rows");
});

router.post("/move", function(req, res, next) {
  res.redirect("/rows");
});

module.exports = router;
