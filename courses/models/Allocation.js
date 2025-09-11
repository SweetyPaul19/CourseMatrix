const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema({
  roll: { type: String, required: true },
  department: { type: String, required: true },   // NEW field
  semester: { type: String, required: true },     // NEW field
  courses: [String],
  allocatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Allocation", allocationSchema);
