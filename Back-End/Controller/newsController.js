const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const News = require("../Models/newsItemsSchema");
const UserLoginSchema = require("../Models/LogInDentalSchema");
const Files = require("../Models/File")
const sharp = require("sharp");
const cloudinary = require("../Utils/cloudinary");

exports.AddNews = AsyncErrorHandler(async (req, res) => {
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);
  const requiredFields = ["title", "date", "excerpt", "category"];

  // Check missing required fields
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

  let imageData = { url: "", public_id: "" };

  // If multer uploaded a file with field name "avatar"
  if (req.file) {
    // Resize and convert image buffer using sharp
    const resizedBuffer = await sharp(req.file.buffer)
      .resize({ width: 512 })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Convert resized buffer to base64 for cloudinary upload
    const base64Image = `data:${
      req.file.mimetype
    };base64,${resizedBuffer.toString("base64")}`;

    // Upload to Cloudinary under specific folder
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

  // Send success response with created news
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
    let uploadPromise;
    let avatar;

    if (req.file) {
      // Prepare Cloudinary upload promise
      const base64Image = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;
      uploadPromise = cloudinary.uploader.upload(base64Image, {
        folder: "Government Archiving/Profile",
      });

      // Delete old avatar in background (non-blocking)
      News.findById(NewsID).then((oldRecord) => {
        if (oldRecord?.avatar?.public_id) {
          cloudinary.uploader
            .destroy(oldRecord.avatar.public_id)
            .catch((err) => {
              console.error("Failed to delete old image from Cloudinary:", err);
            });
        }
      });
    }

    // Wait for Cloudinary upload if there is a file
    if (uploadPromise) {
      const uploadedResponse = await uploadPromise;
      avatar = {
        public_id: uploadedResponse.public_id,
        url: uploadedResponse.secure_url,
      };
    }

    const updateData = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      middle_name: req.body.middle_name,
      email: req.body.email,
      Position: req.body.Position,
      detailInfo: req.body.detailInfo,
      ...(avatar && { avatar }), // Add avatar only if updated
    };

    // Single query for update
    const updatedNews = await News.findByIdAndUpdate(NewsID, updateData, {
      new: true,
    });

    if (!updatedNews) {
      return res.status(404).json({ error: "SB Member not found" });
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
      // optionally continue even if deletion fails
    }
  }

  // 🗑 Delete linked login
  const userLogin = await UserLoginSchema.findOne({ linkedId: NewsID });
  if (userLogin) {
    await UserLoginSchema.findByIdAndDelete(userLogin._id);
  }

  // 🗑 Delete admin record
  await News.findByIdAndDelete(NewsID);

  res.status(200).json({
    status: "success",
    message: "Officer and related login deleted successfully.",
    data: null,
  });
});
