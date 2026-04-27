const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  pdfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Files",
    required: true,
  },
  userId: {
    type: String,
    required: true,
    default: () => `Guest${Math.floor(100000 + Math.random() * 900000)}`,
  },
  commentText: {
    type: String,
    required: true,
  },
  status:{
    type:String,
    enum:["Pending","Approved", "Rejected"],
    default:"Pending"
  },
  ipAddress: { type: String, default: null },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Comment", commentSchema);
