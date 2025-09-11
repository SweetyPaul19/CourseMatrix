const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  roll: String,
  department: String,
  semester: String,   // ✅ Add this line
  courses: [String]
});

module.exports = mongoose.model('Student', studentSchema);
