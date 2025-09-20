const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  excerpt: {
    type: String,
  },
  category: {
    type: String,
    required: true,
    enum: ["Documentation", "News","Announcement"],
  },
  fileUrl: {
    type: String,
    default: null,
  },
  fileName: {
    type: String,
    default: null,
  },
  avatar: {
    url: String,
    public_id: String,
  },
});

// Optional: para auto-convert yung string date kapag nagse-save
newsSchema.pre("save", function (next) {
  if (typeof this.date === "string") {
    this.date = new Date(this.date);
  }
  next();
});

module.exports = mongoose.model("News", newsSchema);
