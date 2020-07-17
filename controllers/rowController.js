var Row = require("../models/row");
var Player = require("../models/player");
const { body } = require("express-validator/check");

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
          // Successful, so render
          // See more at https://expressjs.com/en/api.html#res.format
          res.format({
            'text/html': function(){
              res.render('rows', { title: 'Peliä!', rows_list: list_rows, playerturn: turnData.number});
            },
            'json': function(){
              res.json({'rows_list': list_rows, 'playerturn': turnData.number});
            },
            'default': function(){
              // log the request and respond with 406
              res.status(406).send('Not Acceptable');
            }
          });
        }
      });
    }
  });
};

// Change the content of specific element in "content" array
exports.mark = function(req, res, next) {
  // Mark "X" or "Y" depending on turnToggle
  console.log("mitä korvataaan " + ['content.#{req.body.colNumber}.value']);
  console.log("millä korjataan " + req.body.rowContent[req.body.colNumber]);
  var tekst1 = 'content.'+ String(req.body.colNumber);
  var tekst2 = tekst1 + '.value';
  console.log("tekst1: " + tekst1);
  console.log("tekst2: " + tekst2);
  var bodyIndex = {};
  bodyIndex['content.' + String(req.body.colNumber)] = String(req.body.rowContent[req.body.colNumber]);
  console.log("bodyIndex: " + bodyIndex);
  Row.updateOne(
    // { _id: req.body.rowNumber, ['${tekst1}'] : req.body.colNumber },
    // { $set: { "content.$.content" :  req.body.rowContent[req.body.colNumber] } }
    { _id: req.body.rowNumber},
    { $set: bodyIndex }
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
