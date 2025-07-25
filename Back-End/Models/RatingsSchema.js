const mongoose = require("mongoose");
const RatingSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  userId: {
    type: String,
    required: true,
    default: () => `Guest${Math.floor(100000 + Math.random() * 900000)}`,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

RatingSchema.index({ userId: 1, documentId: 1 }, { unique: true });


module.exports = mongoose.model("Ratings", RatingSchema);
