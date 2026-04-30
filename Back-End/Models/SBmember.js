const mongoose = require("mongoose");

const SBschema = new mongoose.Schema({
  avatar: {
    url: String,
    public_id: String,
  },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  district: String,
  detailInfo: String,
  term: String,
  priorityNumber: {
    type: Number,
    unique: true
  },
  isExOfficial: {
    type: Boolean,
    default: false
  },
  year_from: { type: Number },
  year_to: { type: Number },
  term_from: { type: Date },
  term_to: { type: Date },
  middle_name: String,
  Position: String,
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SBmember", SBschema);
