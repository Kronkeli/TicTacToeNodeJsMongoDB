var Row = require("../models/row");
var Player = require("../models/player");

// Ehkä tarvitaan puhdistamaan syötteitä
// Good validation documentation available at https://express-validator.github.io/docs/
// const { body,validationResult } = require('express-validator/check');
// const { sanitizeBody } = require('express-validator/filter');

// Display list of all posts.
exports.index = function(req, res, next) {
  Row.find({}).exec(function(err, list_rows) {
    if (err) {
      console.log("error in finding row data");
      return next(err);
    } else {
      Player.findOne({ _id: "playerInTurn" }).exec(function(err, turnData) {
        if (err) {
          console.log("error in finding turn data");
          return next(err);
        } else {
          res.render("rows", {
            title: "Peliä!",
            playerturn: turnData.number,
            rows_list: list_rows
          });
        }
      });
    }
  });
};

// Change the content of specific element in "content" array
exports.mark = function(req, res, next) {
  // Mark "X" or "Y" depending on turnToggle
  var tekst = "";
  for (let i = 0; i < req.body.rowContent.length; i++) {
    tekst = tekst + " " + req.body.rowContent[i];
  }
  Row.findOneAndUpdate(
    { _id: req.body.rowNumber },
    { $set: { content: req.body.rowContent.split(",") } }
  ).exec(function(err) {
    if (err) {
      console.log("merkkaus ei onnistunut");
      return next(err);
    } else {
      Player.update({}, { $set: { number: req.body.newPlayerNumber } }).exec(
        function(err, writeResult) {
          if (err) {
            console.log("playerin vaihto ei onnistunut!");
            return next(err);
          } else {
            res.redirect("/rows");
          }
        }
      );
    }
    console.log("nyt ollaan jossain!");
    console.log("terveiusin controller " + req.body.rowNumber);
    console.log("terveisin controller " + req.body.rowContent);
    console.log("terveisin cvontroller " + req.body.newPlayerNumber);
  });
};

exports.clearFill = function(req, res, next) {
  console.log("poistetaan kaikki perutaan bäägh");
  Row.update(
    {},
    { $set: { content: ["", "", "", "", ""] } },
    { multi: true }
  ).exec(function(err, writeResult) {
    if (err) {
      console.log("update epäonnistui jostain syystä");
    } else {
      Player.update({}, { $set: { number: 1 } }).exec(function(
        err,
        writeResult
      ) {
        if (!err) {
          console.log("taulukko tyhjennetty ja pelaaja vaihdettu");
          res.redirect("/rows");
        }
      });
    }
  });
};
