const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const News = require("../Models/newsItemsSchema");
const streamifier = require("streamifier");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

exports.AddNews = AsyncErrorHandler(async (req, res) => {
  const requiredFields = ["title", "date", "excerpt", "category"];
  const missingFields = requiredFields.filter((field) => !req.body[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  let { title, date, excerpt, category } = req.body;

  // --- 2Date Validation ---
  if (typeof date === "string") {
    date = new Date(date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid date format." });
    }
  }

  // --- 3Category Limits ---
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

  // --- 4Image Upload to Hostinger ---
  let avatar = { url: "", public_id: "" };

  if (req.file) {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Invalid image type" });
    }

    const fileName = req.file.filename; // filename sa disk
    try {
      const form = new FormData();
      form.append("file", fs.createReadStream(req.file.path), req.file.originalname);

      const response = await axios.post(
        "https://tan-kudu-520349.hostingersite.com/upload.php",
        form,
        {
          headers: form.getHeaders(),
          maxBodyLength: Infinity,
        }
      );

      if (!response.data.success) {
        return res.status(500).json({
          error: response.data.message || "Failed to upload image",
        });
      }

      avatar = {
        url: response.data.url, // Public URL returned by Hostinger
        public_id: fileName,
      };
      console.log("News image uploaded to Hostinger:", avatar.url);

      // Optional: Delete temp file after upload
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
      });
    } catch (err) {
      console.error(
        "Hostinger upload failed:",
        err.response?.data || err.message
      );
      return res.status(500).json({ error: "Failed to upload news image" });
    }
  }

  // --- 5Save News in DB ---
  const newNews = await News.create({
    title,
    date,
    excerpt,
    category,
    avatar,
  });

  // --- 6Response ---
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

    data = data.map((item) => ({
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

exports.UpdateNews = AsyncErrorHandler(async (req, res) => {
  const NewsID = req.params.id;

  try {
    const oldRecord = await News.findById(NewsID);
    if (!oldRecord) {
      return res.status(404).json({ error: "News not found" });
    }

    const avatarObj = oldRecord.avatar || {};
    let newAvatarUrl = avatarObj.url || null;
    const oldAvatarUrl = avatarObj.url;

    // --- Upload new image if exists ---
    if (req.file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Invalid image type" });
      }

      const fileName = req.file.filename; // filename sa disk
      const form = new FormData();
      form.append("file", fs.createReadStream(req.file.path), req.file.originalname);

      try {
        const uploadResponse = await axios.post(
          "https://tan-kudu-520349.hostingersite.com/upload.php",
          form,
          {
            headers: form.getHeaders(),
            maxBodyLength: Infinity,
          }
        );

        if (!uploadResponse.data.success) {
          return res.status(500).json({
            error: uploadResponse.data.message || "Failed to upload new image",
          });
        }

        newAvatarUrl = uploadResponse.data.url;
        console.log("New news image uploaded to Hostinger:", newAvatarUrl);

        // Optional: delete temp file
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Failed to delete temp file:", err);
        });
      } catch (err) {
        console.error("Hostinger upload failed:", err.response?.data || err.message);
        return res.status(500).json({ error: "Failed to upload news image" });
      }
    }

    // --- Prepare update data ---
    const updateData = {
      title: req.body.title,
      date: req.body.date,
      excerpt: req.body.excerpt,
      category: req.body.category,
      detailInfo: req.body.detailInfo,
    };

    if (req.file) {
      updateData.avatar = {
        ...avatarObj,
        url: newAvatarUrl,
      };
    }

    // --- Update DB ---
    const updatedNews = await News.findByIdAndUpdate(NewsID, updateData, { new: true });
    if (!updatedNews) {
      return res.status(404).json({ error: "News not found after update" });
    }

    res.json({ status: "success", data: updatedNews });

    // --- Delete old image in background if new image uploaded ---
    if (req.file && oldAvatarUrl) {
      const params = new URLSearchParams();
      params.append("file", oldAvatarUrl);

      axios.post(
          "https://tan-kudu-520349.hostingersite.com/delete.php",
          params.toString(),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        )
        .then(response => {
          if (response.data.success) {
            console.log("Old news image deleted in background:", oldAvatarUrl);
          } else {
            console.error("Failed to delete old news image in background:", response.data.message);
          }
        })
        .catch(error => {
          console.error("Error deleting old news image in background:", error.message);
        });
    }

  } catch (error) {
    console.error("UpdateNews Error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

exports.deleteNews = AsyncErrorHandler(async (req, res, next) => {
  const NewsID = req.params.id;

  const existingNews = await News.findById(NewsID);
  if (!existingNews) {
    return res.status(404).json({
      status: "fail",
      message: "News not found.",
    });
  }

  const avatarUrlToDelete = existingNews.avatar?.url;

  // Hakbang 1: Tanggalin ang database record
  await News.findByIdAndDelete(NewsID);

  // Hakbang 2: Magbigay ng mabilis na success response sa user
  res.status(200).json({
    status: "success",
    message: "News and related image deleted successfully.",
    data: null,
  });

  // Hakbang 3: "Fire and Forget" - I-delete ang image file sa background
  if (avatarUrlToDelete) {
    const params = new URLSearchParams();
    params.append("file", avatarUrlToDelete);

    axios
      .post(
        "https://tan-kudu-520349.hostingersite.com/delete.php",
        params.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((response) => {
        if (response.data.success) {
          console.log(
            "News image deleted from Hostinger in background:",
            avatarUrlToDelete
          );
        } else {
          console.error(
            "Failed to delete news image from Hostinger in background:",
            response.data.message
          );
        }
      })
      .catch((error) => {
        console.error(
          "Error deleting news image from Hostinger in background:",
          error.message
        );
      });
  }
});
