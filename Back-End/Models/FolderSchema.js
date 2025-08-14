const mongoose = require("mongoose");
const FolderSchema = new mongoose.Schema({
  folderName: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  color:String,
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Folder", FolderSchema);
