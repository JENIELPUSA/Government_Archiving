const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  category: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Category", DepartmentSchema);
