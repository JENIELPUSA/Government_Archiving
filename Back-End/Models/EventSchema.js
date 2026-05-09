const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", EventSchema);