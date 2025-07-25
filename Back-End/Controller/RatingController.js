const mongoose = require("mongoose");
const Rating = require("../Models/RatingsSchema");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");

exports.addRating = AsyncErrorHandler(async (req, res) => {
  const { documentId, rating } = req.body;

  if (!documentId || typeof rating !== 'number') {
    return res.status(400).json({ message: 'Missing or invalid data.' });
  }

  const newRating = new Rating({ documentId, rating });
  await newRating.save();

  res.status(201).json({
    status:"success",
    message: 'Rating added successfully.',
    data: newRating,
  });
});

exports.getRatingSummary = AsyncErrorHandler(async (req, res) => {
  const { documentId } = req.params;
  const userId = req.user ? req.user._id : null;

  const ratings = await Rating.find({ documentId });

  const totalRatingsCount = ratings.length;
  const averageRating = totalRatingsCount > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatingsCount
    : 0;

  let userRating = 0; 
  if (userId) {
    const foundUserRating = await Rating.findOne({ documentId, userId });
    if (foundUserRating) {
      userRating = foundUserRating.rating;
    }
  }

  res.status(200).json({
    status: "success",
    averageRating: parseFloat(averageRating.toFixed(1)),
    totalRatingsCount,
    userRating,
  });
});
