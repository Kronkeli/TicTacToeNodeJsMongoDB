var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var RowSchema = new Schema({
  _id: { type: Number },
  content: { type: Array }
});

// Export model.
module.exports = mongoose.model("Row", RowSchema);
