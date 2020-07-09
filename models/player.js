var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PlayerSchema = new Schema({
  _id: { type: String },
  number: { type: Number }
});

// Export model.
module.exports = mongoose.model("Player", PlayerSchema);
