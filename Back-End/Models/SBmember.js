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
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  middle_name: String,
  Position: String,
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SBmember", SBschema);
