const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const News = require("../Models/newsItemsSchema");
const path = require("path");
const fs = require("fs/promises"); 
const sharp = require("sharp");
const cloudinary = require("../Utils/cloudinary");
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

exports.AddNews = AsyncErrorHandler(async (req, res) => {
  const requiredFields = ["title", "date", "excerpt", "category"];
  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  let { title, date, excerpt, category } = req.body;

  if (typeof date === "string") {
    date = new Date(date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid date format." });
    }
  }

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

  let imageData = { url: "" };

  if (req.file) {
    // Multer (diskStorage) has already saved the file.
    // We just need to get the file path and save it to the database.
    const fileName = path.basename(req.file.path);
    imageData.url = `/uploads/${fileName}`;
  }

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
    const oldRecord = await News.findById(NewsID);
    if (!oldRecord) {
      return res.status(404).json({ error: "News not found" });
    }

    let avatarData = oldRecord.avatar || null;

    if (req.file) {
      // Tanggalin ang lumang file kung mayroon
      if (oldRecord.avatar?.url) {
        const oldFileName = path.basename(oldRecord.avatar.url);
        const oldFilePath = path.join(uploadsDir, oldFileName);
        
        try {
          // Gumamit ng fs.promises.unlink para async ang pag-delete
          await fs.unlink(oldFilePath);
        } catch (err) {
          // I-log ang error pero huwag mag-crash kung hindi ma-delete ang lumang file
          console.error("Failed to delete old image:", err.message);
        }
      }

      // I-save ang bagong file sa local storage
      const newFilePath = req.file.path; // Galing ito sa multer.diskStorage
      const fileName = path.basename(newFilePath);
      avatarData = { url: `/uploads/${fileName}` };
    }

    // I-update ang database record
    const updateData = {
      title: req.body.title,
      date: req.body.date,
      excerpt: req.body.excerpt,
      category: req.body.category,
      detailInfo: req.body.detailInfo,
      // I-update lang ang avatar kung may bagong file
      avatar: avatarData,
    };

    const updatedNews = await News.findByIdAndUpdate(NewsID, updateData, { new: true });

    if (!updatedNews) {
      return res.status(404).json({ error: "News not found after update" });
    }

    res.json({ status: "success", data: updatedNews });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};


exports.deleteNews = AsyncErrorHandler(async (req, res, next) => {
  const NewsID = req.params.id;

  const existingNews = await News.findById(NewsID);
  if (!existingNews) {
    return res.status(404).json({
      status: "fail",
      message: "News not found.",
    });
  }

  // Tanggalin ang lokal na image file kung mayroon
  if (existingNews.avatar && existingNews.avatar.url) {
    const fileName = path.basename(existingNews.avatar.url);
    const filePath = path.join(uploadsDir, fileName);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error("Local file deletion failed:", error);
      // It's okay to continue even if the file deletion fails,
      // as the primary goal is to remove the database record.
    }
  }

  // Tanggalin ang database record
  await News.findByIdAndDelete(NewsID);

  res.status(200).json({
    status: "success",
    message: "News and related image deleted successfully.",
    data: null,
  });
});
