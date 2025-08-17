const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const News = require("../Models/newsItemsSchema");
const UserLoginSchema = require("../Models/LogInDentalSchema");
const Files = require("../Models/File")
const sharp = require("sharp");
const cloudinary = require("../Utils/cloudinary");

exports.AddNews = AsyncErrorHandler(async (req, res) => {
  const requiredFields = ["title", "date", "excerpt", "category"];
  const missingFields = requiredFields.filter((field) => !req.body[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  let { title, date, excerpt, category } = req.body;

  // Convert date string to Date object if necessary
  if (typeof date === "string") {
    date = new Date(date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid date format." });
    }
  }

  // Check category limit
  const categoryLimits = {
    Carousel: 5,
    Documentation: 10,
  };

  if (categoryLimits[category]) {
    const currentCount = await News.countDocuments({ category });
    if (currentCount >= categoryLimits[category]) {
      return res.status(400).json({
        message: `Cannot add more than ${categoryLimits[category]} items in category ${category}.`,
      });
    }
  }

  let imageData = { url: "", public_id: "" };

  if (req.file) {
    const resizedBuffer = await sharp(req.file.buffer)
      .resize({ width: 512 })
      .jpeg({ quality: 80 })
      .toBuffer();

    const base64Image = `data:${
      req.file.mimetype
    };base64,${resizedBuffer.toString("base64")}`;

    const uploadedResponse = await cloudinary.uploader.upload(base64Image, {
      folder: "Government Archiving/News",
    });

    imageData = {
      url: uploadedResponse.secure_url,
      public_id: uploadedResponse.public_id,
    };
  }

  // Create new News document
  const newNews = await News.create({
    title,
    date,
    excerpt,
    category,
    avatar: imageData,
  });

  return res.status(201).json({
    status: "Success",
    news: newNews,
  });
});
exports.DisplayNews = AsyncErrorHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const { search = "", dateFrom, dateTo } = req.query;

    const filter = {};

    if (search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { excerpt: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) {
        filter.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        filter.date.$lt = endDate;
      }
    }

    const totalNews = await News.countDocuments(filter);

    let data = await News.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .select("_id avatar title date excerpt category")
      .lean();

    data = data.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("en-US"), // Format: MM/DD/YYYY
    }));

    res.status(200).json({
      status: "success",
      data,
      totalNews,
      currentPage: page,
      totalPages: Math.ceil(totalNews / limit),
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong while fetching news.",
      error: error.message,
    });
  }
});


exports.UpdateNews = async (req, res) => {
  const NewsID = req.params.id;

  try {
    let avatar;

    if (req.file) {
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
        "base64"
      )}`;

      let uploadedResponse;
      try {
        uploadedResponse = await cloudinary.uploader.upload(base64Image, {
          folder: "Government Archiving/Profile",
        });
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr);
        return res.status(500).json({ error: "Failed to upload image." });
      }

      avatar = {
        public_id: uploadedResponse.public_id,
        url: uploadedResponse.secure_url,
      };

      // Delete old avatar in background (optional, non-blocking)
      News.findById(NewsID).then((oldRecord) => {
        if (oldRecord?.avatar?.public_id) {
          cloudinary.uploader
            .destroy(oldRecord.avatar.public_id)
            .catch((err) =>
              console.error("Failed to delete old image from Cloudinary:", err)
            );
        }
      });
    }

    // Update database only after successful upload (or if no new file)
    const updateData = {
      title: req.body.title,
      date: req.body.date,
      excerpt: req.body.excerpt,
      category: req.body.category,
      detailInfo: req.body.detailInfo,
      ...(avatar && { avatar }), // include avatar only if uploaded
    };

    const updatedNews = await News.findByIdAndUpdate(NewsID, updateData, {
      new: true,
    });

    if (!updatedNews) {
      return res.status(404).json({ error: "News not found" });
    }

    res.json({ status: "success", data: updatedNews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};


exports.deleteNews = AsyncErrorHandler(async (req, res, next) => {
  const NewsID = req.params.id;

  const existingSB = await News.findById(NewsID);
  if (!existingSB) {
    return res.status(404).json({
      status: "fail",
      message: "Officer not found.",
    });
  }

  if (existingSB.avatar && existingSB.avatar.public_id) {
    try {
      await cloudinary.uploader.destroy(existingSB.avatar.public_id);
    } catch (error) {
      console.error("Cloudinary deletion failed:", error);
    }
  }

  await News.findByIdAndDelete(NewsID);

  res.status(200).json({
    status: "success",
    message: "Officer and related login deleted successfully.",
    data: null,
  });
});
