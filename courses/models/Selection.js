const mongoose = require("mongoose");

const selectionSchema = new mongoose.Schema({
  roll: { type: String, required: true },
  department: { type: String, required: true },   // NEW field
  semester: { type: String, required: true },     // NEW field
  courses: [String],
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Selection", selectionSchema);
