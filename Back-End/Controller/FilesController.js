const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Files = require("../Models/File");
const path = require("path");
const cloudinary = require("../Utils/cloudinary");
const mongoose = require("mongoose");
const ActivityLog = require("./../Models/LogActionAudit");
const Notification = require("../Models/NotificationSchema");
const UserLoginSchema = require("../Models/LogInDentalSchema");
const Category = require("../Models/CategorySchema");
const SBmember = require("../Models/SBmember");
const { Blob } = require("buffer");
const axios = require("axios");
const ftp = require("basic-ftp");
const fs = require("fs");
const FormData = require("form-data");




const sanitizeFolderName = (name) => {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .trim();
};

const ftpClient = new ftp.Client();
ftpClient.ftp.verbose = true;
let isFtpConnected = false;

async function connectFTP() {
  if (!isFtpConnected) {
    await ftpClient.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: false,
      passive: true,
    });
    isFtpConnected = true;
  }
  return ftpClient;
}

exports.updateFiles = AsyncErrorHandler(async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    const newStatus = req.body.ArchivedStatus;
    const admin = req.user.linkId;
    if (newStatus === "Deleted") {
      updateData.archivedMetadata = {
        dateArchived: new Date(),
        archivedBy: admin,
        notes: "Archived due to delete",
      };
    }

    const oldFile = await Files.findById(req.params.id);
    if (!oldFile) {
      return res
        .status(404)
        .json({ status: "fail", message: "File not found" });
    }

    const updatedFile = await Files.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
    const allowedRoles = ["admin", "officer"];
    const role = req.user?.role?.toLowerCase();

    if (allowedRoles.includes(role)) {
      const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);

      let logType = "UPDATE";
      let logAction = "Updated a DocumentFile";
      let logMessage = `${capitalizedRole} updated file '${updatedFile.title}'`;
      let logLevel = "info";

      if (newStatus === "Deleted") {
        logType = "DELETE";
        logAction = "Deleted a DocumentFile";
        logMessage = `${capitalizedRole} deleted file '${updatedFile.title}'`;
        logLevel = "warning";
      }

      if (newStatus === "For Restore") {
        logType = "RESTORE";
        logAction = "Restore a DocumentFile";
        logMessage = `${capitalizedRole} restored file '${updatedFile.title}'`;
        logLevel = "info";
      }

      // Note: Removed 'Archived' logging logic
      await ActivityLog.create({
        type: logType,
        action: logAction,
        performedBy: req.user.linkId,
        performedByModel: capitalizedRole,
        file: updatedFile._id,
        beforeChange: oldFile,
        afterChange: updatedFile,
        message: logMessage,
        level: logLevel,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
    }

    res.status(200).json({ status: "success", data: updatedFile });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

exports.updateStatus = AsyncErrorHandler(async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    const newStatus = req.body.ArchivedStatus;
    const admin = req.user.linkId;

    if (newStatus === "Deleted") {
      updateData.archivedMetadata = {
        dateArchived: new Date(),
        archivedBy: admin,
        notes: "Archived due to delete",
      };
    }

    const oldFile = await Files.findById(req.params.id);
    if (!oldFile) {
      return res
        .status(404)
        .json({ status: "fail", message: "File not found" });
    }

    await Files.findByIdAndUpdate(req.params.id, updateData, {
      runValidators: true,
    });

    const updatedResult = await Files.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "officers",
          localField: "officer",
          foreignField: "_id",
          as: "officer",
        },
      },
      { $unwind: { path: "$officer", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "admins",
          localField: "admin",
          foreignField: "_id",
          as: "admin",
        },
      },
      { $unwind: { path: "$admin", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "admins",
          localField: "archivedMetadata.archivedBy",
          foreignField: "_id",
          as: "archivedByAdmin",
        },
      },
      {
        $unwind: { path: "$archivedByAdmin", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          title: 1,
          summary: 1,
          author: 1,
          fullText: 1,
          fileSize: 1,
          fileUrl: 1,
          fileName: 1,
          status: 1,
          tags: 1,
          notes: 1,
          approverID: 1,
          createdAt: 1,
          updatedAt: 1,
          ArchivedStatus: 1,
          archivedMetadata: 1,
          categoryID: "$category._id",
          category: "$category.category",
          officer: "$officer._id",
          officer_first_name: "$officer.first_name",
          officer_last_name: "$officer.last_name",
          admin: 1,
          admin_first_name: "$admin.first_name",
          admin_last_name: "$admin.last_name",
          archivedBy_first_name: "$archivedByAdmin.first_name",
          archivedBy_last_name: "$archivedByAdmin.last_name",
        },
      },
    ]);

    const updatedFile = updatedResult[0];

    const fileId = updatedFile._id;

    const isRestored =
      oldFile.ArchivedStatus === "For Restore" &&
      updatedFile.ArchivedStatus === "Active";

    const statusChanged = oldFile.status !== updatedFile.status;
    const validStatuses = ["Pending", "Approved", "Rejected"];
    const isStatusNotification =
      updatedFile.ArchivedStatus !== "Deleted" &&
      validStatuses.includes(updatedFile.status);

    const shouldNotify = isRestored || (statusChanged && isStatusNotification);

    const fileTitle = updatedFile.title || "Untitled";
    const categoryTitle = updatedFile.category || "Unknown Category";

    let messageText = null;
    if (isRestored) {
      messageText = `A document has been restored. Title: "${fileTitle}" from ${categoryTitle}`;
    } else if (statusChanged) {
      if (updatedFile.status === "Approved") {
        messageText = `Document approved: "${fileTitle}"`;
      } else if (updatedFile.status === "Rejected") {
        messageText = `Document rejected: "${fileTitle}"`;
      }
    }

    if (shouldNotify && messageText) {
      try {
        const adminLogins = await UserLoginSchema.find({ role: "admin" });
        const linkedUserIds = adminLogins.map((a) => a.linkedId);

        const viewersArray = linkedUserIds.map((userId) => ({
          user: userId,
          isRead: false,
        }));

        const notificationDoc = await Notification.create({
          message: messageText,
          viewers: viewersArray,
          FileId: fileId,
        });

        const io = req.app.get("io");

        const SendMessage = {
          message: messageText,
          data: updatedFile,
          notificationId: notificationDoc._id,
          FileId: fileId,
        };

        adminLogins.forEach((adminUser) => {
          const adminId = adminUser.linkedId.toString();
          const targetUser = global.connectedUsers?.[adminId];

          if (targetUser) {
            io.to(targetUser.socketId).emit(
              "SentDocumentNotification",
              SendMessage
            );
            console.log(
              `📨 Sent socket notification to ONLINE admin (${adminId})`
            );
          } else {
            console.log(`📭 Admin (${adminId}) is OFFLINE — saved in DB only.`);
          }
        });

        io.emit("UpdateFileData", updatedFile);
        console.log("✅ Notification saved to DB:", notificationDoc._id);
      } catch (error) {
        console.error("❌ Notification DB save failed:", error.message);
      }
    }

    // Activity Log
    const allowedRoles = ["admin", "officer"];
    const role = req.user?.role?.toLowerCase();

    if (allowedRoles.includes(role)) {
      const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
      let logType = "UPDATE";
      let logAction = "Updated a DocumentFile";
      let logMessage = `${capitalizedRole} updated file '${fileTitle}'`;
      let logLevel = "info";

      if (newStatus === "Deleted") {
        logType = "DELETE";
        logAction = "Deleted a DocumentFile";
        logMessage = `${capitalizedRole} deleted file '${fileTitle}'`;
        logLevel = "warning";
      }

      if (newStatus === "Archived") {
        logType = "ARCHIVE";
        logAction = "Move to an Archived DocumentFile";
        logMessage = `${capitalizedRole} archived file '${fileTitle}'`;
        logLevel = "warning";
      }

      if (newStatus === "For Restore") {
        logType = "RESTORE";
        logAction = "Restore a DocumentFile";
        logMessage = `${capitalizedRole} restored file '${fileTitle}'`;
        logLevel = "info";
      }

      await ActivityLog.create({
        type: logType,
        action: logAction,
        performedBy: req.user.linkId,
        performedByModel: capitalizedRole,
        file: updatedFile._id,
        beforeChange: oldFile,
        afterChange: updatedFile,
        message: logMessage,
        level: logLevel,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
    }

    res.status(200).json({ status: "success", data: updatedFile });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});



exports.createFiles = async (req, res) => {
  try {
    if (!req.file) {
      console.error("No file uploaded. Request body:", req.body);
      return res.status(400).json({ error: "No file uploaded" });
    }

    const {
      title,
      category,
      summary,
      author,
      admin,
      resolutionNumber,
      dateOfResolution,
      approverID,
      oldFile,
      folderID,
      status = "Pending",
    } = req.body;

    if (!title || !admin || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(admin)) {
      return res.status(400).json({ error: "Invalid admin ID" });
    }

    if (approverID && !mongoose.Types.ObjectId.isValid(approverID)) {
      return res.status(400).json({ error: "Invalid approver ID" });
    }

    // File details
    const fileName = req.file.filename;
    const fileSize = req.file.size;
    const ext = path.extname(req.file.originalname).toLowerCase();

    const typeMap = {
      ".pdf": "PDF",
      ".doc": "Word Document",
      ".docx": "Word Document",
      ".xls": "Excel Spreadsheet",
      ".xlsx": "Excel Spreadsheet",
      ".ppt": "PowerPoint Presentation",
      ".pptx": "PowerPoint Presentation",
      ".txt": "Text File",
      ".jpg": "Image",
      ".jpeg": "Image",
      ".png": "Image",
      ".gif": "Image",
      ".svg": "Image",
      ".webp": "Image",
    };
    const fullTextType = typeMap[ext] || "Unknown";

    // --- Upload to Hostinger ---
    let remotePath;
    try {
      const form = new FormData();
      form.append("file", fs.createReadStream(req.file.path), req.file.originalname);

      const response = await axios.post(
        "https://tan-kudu-520349.hostingersite.com/upload.php",
        form,
        {
           headers: { "Content-Type": "multipart/form-data" },
          maxBodyLength: Infinity,
        }
      );

      if (!response.data.success) {
        return res.status(500).json({
          error: response.data.message || "Failed to upload to Hostinger",
        });
      }

      remotePath = response.data.url;
      console.log("File uploaded to Hostinger:", remotePath);

      // Delete temp file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
      });
    } catch (phpErr) {
      console.error("Hostinger upload failed:", phpErr.response?.data || phpErr.message || phpErr);
      return res.status(500).json({ error: "Failed to upload file to Hostinger" });
    }

    // --- Prepare file data for DB ---
    const fileData = {
      title,
      resolutionNumber,
      category,
      summary,
      author,
      fileSize,
      admin,
      approverID,
      status,
      dateOfResolution,
      fileName,
      fileUrl: remotePath,
      oldFile,
      folderID,
      folderPath: "/uploads",
      fullText: fullTextType,
    };

    // Check category for special status
    let categoryName = null;
    if (mongoose.Types.ObjectId.isValid(category)) {
      const categoryDoc = await Category.findById(category).lean();
      categoryName = categoryDoc?.category;
    }
    if (oldFile === "true" || oldFile === true) {
      if (categoryName === "Resolution" || categoryName === "Ordinance") {
        fileData.status = "Approved";
        fileData.ArchivedStatus = "Active";
      } else {
        fileData.ArchivedStatus = "Archived";
      }
    }

    // --- Save to database ---
    let savedFile;
    try {
      savedFile = await new Files(fileData);
      await savedFile.save();
      console.log("File saved to database:", savedFile._id);
    } catch (dbErr) {
      console.error("Database save error:", dbErr);
      return res.status(500).json({ error: "Failed to save file to database" });
    }

    // --- Log activity ---
    const allowedRoles = ["admin", "officer"];
    const role = req.user?.role?.toLowerCase();
    const capitalizedRole = role?.charAt(0).toUpperCase() + role?.slice(1);

    if (allowedRoles.includes(role)) {
      await ActivityLog.create({
        type: "CREATE",
        action: "Uploaded a new file",
        performedBy: req.user.linkId,
        performedByModel: capitalizedRole,
        file: savedFile._id,
        message: `${capitalizedRole} uploaded file: '${title}'`,
        level: "info",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
    }

    // --- Notifications for Pending ---
    if (savedFile.status === "Pending") {
      const fileId = savedFile._id;
      const fileTitle = savedFile.title || "Untitled Document";
      const categoryTitle = savedFile.category || "Unknown Category";
      const messageText = `New document pending your approval: "${fileTitle}" from ${categoryTitle}`;

      const targetViewer =
        approverID && mongoose.Types.ObjectId.isValid(approverID)
          ? approverID
          : author;

      if (mongoose.Types.ObjectId.isValid(targetViewer)) {
        const viewersArray = [
          { user: targetViewer, isRead: false, isApprover: !!approverID },
        ];

        if (approverID) {
          const notificationDoc = await Notification.create({
            message: messageText,
            viewers: viewersArray,
            FileId: fileId,
            relatedApprover: approverID,
          });

          const io = req.app.get("io");
          if (io) {
            const SendMessage = {
              message: messageText,
              data: savedFile,
              notificationId: notificationDoc._id,
              FileId: fileId,
              approverID: approverID,
            };

            const receiver = global.connectedUsers?.[targetViewer];
            if (receiver) {
              io.to(receiver.socketId).emit("SentDocumentNotification", SendMessage);
              console.log(`📨 Sent real-time notification to USER (${targetViewer})`);
            } else {
              console.log(`📭 User (${targetViewer}) is OFFLINE - notification saved in DB`);
            }
          }
        }
      }
    }

    res.status(201).json({ status: "success", data: savedFile });
  } catch (err) {
    console.error("Upload error:", err.message || err);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.DisplayFiles = AsyncErrorHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  const { title, tags, status, category, dateFrom, dateTo } = req.query;

  const matchStage = {
    ArchivedStatus: "Active",
  };

  if (title) {
    matchStage.title = { $regex: title, $options: "i" };
  }

  if (tags) {
    let tagArray = [];

    if (Array.isArray(tags)) {
      tagArray = tags.map((tag) => tag.trim().toLowerCase());
    } else if (typeof tags === "string") {
      tagArray = tags.split(",").map((tag) => tag.trim().toLowerCase());
    }

    if (tagArray.length > 0) {
      matchStage.tags = { $in: tagArray };
    }
  }

  if (status) {
    matchStage.status = status;
  }

  if (category) {
    matchStage.category = new mongoose.Types.ObjectId(category);
  }

  // Add date range filter
  if (dateFrom || dateTo) {
    matchStage.createdAt = {};
    if (dateFrom) {
      matchStage.createdAt.$gte = new Date(dateFrom);
    }
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      matchStage.createdAt.$lte = endOfDay;
    }
  }

  const activeTagDocs = await Files.aggregate([
    { $match: { ArchivedStatus: "Active" } },
    { $project: { tags: 1 } },
  ]);

  const allActiveTagsSet = new Set();
  activeTagDocs.forEach((doc) => {
    if (Array.isArray(doc.tags)) {
      doc.tags.forEach((tag) => allActiveTagsSet.add(tag));
    }
  });

  const allActiveTags = Array.from(allActiveTagsSet);

  const result = await Files.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "admins",
        localField: "admin",
        foreignField: "_id",
        as: "adminInfo",
      },
    },
    {
      $lookup: {
        from: "sbmembers",
        localField: "author",
        foreignField: "_id",
        as: "authorInfo",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    {
      $lookup: {
        from: "officers",
        localField: "officer",
        foreignField: "_id",
        as: "officerInfo",
      },
    },
    {
      $lookup: {
        from: "admins",
        localField: "archivedMetadata.archivedBy",
        foreignField: "_id",
        as: "archiverInfo",
      },
    },
    { $unwind: { path: "$authorInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$adminInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$officerInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$archiverInfo", preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              title: 1,
              summary: 1,
              fullText: 1,
              fileUrl: 1,
              fileName: 1,
              status: 1,
              approverID: 1,
              suggestion: 1,
              ArchivedStatus: 1,
              fileSize: 1,
              oldFile: 1,
              tags: 1,
              createdAt: 1,
              dateOfResolution: 1,
              resolutionNumber: 1,
              updatedAt: 1,
              "archivedMetadata.dateArchived": 1,
              "archivedMetadata.notes": 1,
              "archivedMetadata.archivedBy": 1,
              author: {
                $concat: [
                  "$authorInfo.first_name",
                  " ",
                  "$authorInfo.middle_name",
                  " ",
                  "$authorInfo.last_name",
                ],
              },
              departmentID: "$authorInfo._id",
              category: "$categoryInfo.category",
              categoryID: "$categoryInfo._id",
              admin: 1,
              admin_first_name: "$adminInfo.first_name",
              admin_last_name: "$adminInfo.last_name",
              archivedBy_first_name: "$archiverInfo.first_name",
              archivedBy_last_name: "$archiverInfo.last_name",
              officer: "$officerInfo._id",
              officer_first_name: "$officerInfo.first_name",
              officer_last_name: "$officerInfo.last_name",
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ]).allowDiskUse(true);

  const files = result[0].data || [];
  const totalCount = result[0].totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const totalDocumentsToday = await Files.countDocuments({
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    ArchivedStatus: { $ne: "For Restore" },
  });

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const latestBill = await Files.find({
    ArchivedStatus: "Active",
    status: "Approved",
    dateOfResolution: {
      $gte: startOfWeek,
      $lte: endOfWeek,
    },
  })
    .sort({ dateOfResolution: -1 })
    .limit(3)
    .select("title dateOfResolution status fileUrl fileName");

  res.status(200).json({
    status: "success",
    currentPage: page,
    totalPages,
    latestBill,
    totalCount,
    totalDocumentsToday,
    results: files.length,
    data: files,
    activeTags: allActiveTags,
  });
});

exports.getLatestBillsThisWeek = async (req, res) => {
  try {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const latestBill = await Files.aggregate([
      {
        $match: {
          ArchivedStatus: "Active",
          status: "Approved", // o "Approved" kung yun ang gamit mo
          dateOfResolution: { $ne: null }, // para sigurado may date
        },
      },
      {
        $lookup: {
          from: "admins",
          localField: "admin",
          foreignField: "_id",
          as: "adminInfo",
        },
      },
      {
        $lookup: {
          from: "sbmembers",
          localField: "author",
          foreignField: "_id",
          as: "authorInfo",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      {
        $lookup: {
          from: "officers",
          localField: "officer",
          foreignField: "_id",
          as: "officerInfo",
        },
      },
      {
        $lookup: {
          from: "admins",
          localField: "archivedMetadata.archivedBy",
          foreignField: "_id",
          as: "archiverInfo",
        },
      },
      { $unwind: { path: "$authorInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$adminInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$officerInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$archiverInfo", preserveNullAndEmptyArrays: true } },

      // sort by dateOfResolution para latest base sa resolution date
      { $sort: { dateOfResolution: -1 } },
      { $limit: 3 }, // tatlo lang

      {
        $project: {
          title: 1,
          summary: 1,
          fullText: 1,
          fileUrl: 1,
          fileName: 1,
          status: 1,
          approverID: 1,
          suggestion: 1,
          ArchivedStatus: 1,
          fileSize: 1,
          tags: 1,
          createdAt: 1,
          dateOfResolution: 1,
          resolutionNumber: 1,
          updatedAt: 1,
          "archivedMetadata.dateArchived": 1,
          "archivedMetadata.notes": 1,
          "archivedMetadata.archivedBy": 1,
          author: {
            $concat: [
              "$authorInfo.first_name",
              " ",
              "$authorInfo.middle_name",
              " ",
              "$authorInfo.last_name",
            ],
          },
          departmentID: "$authorInfo._id",
          category: "$categoryInfo.category",
          categoryID: "$categoryInfo._id",
          admin: 1,
          admin_first_name: "$adminInfo.first_name",
          admin_last_name: "$adminInfo.last_name",
          archivedBy_first_name: "$archiverInfo.first_name",
          archivedBy_last_name: "$archiverInfo.last_name",
          officer: "$officerInfo._id",
          officer_first_name: "$officerInfo.first_name",
          officer_last_name: "$officerInfo.last_name",
        },
      },
    ]).allowDiskUse(true);
    res.status(200).json({
      status: "success",
      latestBill,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllAuthorsWithFiles = AsyncErrorHandler(async (req, res, next) => {
  const { search, district, detailInfo, term_from, term_to } = req.query;
  const aggregationPipeline = [];

  const matchStage = {};
  if (district) matchStage.district = district;
  if (detailInfo) matchStage.detailInfo = detailInfo;
  if (Object.keys(matchStage).length > 0)
    aggregationPipeline.push({ $match: matchStage });

  aggregationPipeline.push(
    {
      $lookup: {
        from: "files",
        let: { authorId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$author", "$$authorId"] },
              ArchivedStatus: { $ne: "For Restore" },
            },
          },
        ],
        as: "files",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "files.category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    {
      $addFields: {
        fullName: {
          $concat: [
            "$first_name",
            " ",
            { $ifNull: ["$middle_name", ""] },
            " ",
            "$last_name",
          ],
        },
        memberInfo: "$$ROOT",
      },
    }
  );

  // --- Search filter ---
  if (search) {
    aggregationPipeline.push({
      $match: {
        $or: [
          { first_name: { $regex: search, $options: "i" } },
          { middle_name: { $regex: search, $options: "i" } },
          { last_name: { $regex: search, $options: "i" } },
          { fullName: { $regex: search, $options: "i" } },
          { "files.title": { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  // --- Term filter before grouping ---
  if (term_from && term_to) {
    const from = parseInt(term_from);
    const to = parseInt(term_to);
    aggregationPipeline.push({
      $match: {
        term_from: { $gte: from },
        term_to: { $lte: to },
      },
    });
  }

  // --- Group by term ---
  aggregationPipeline.push(
    {
      $group: {
        _id: {
          term_from: "$memberInfo.term_from",
          term_to: "$memberInfo.term_to",
        },
        members: {
          $push: {
            _id: "$_id",
            fullName: "$fullName",
            district: "$district",
            detailInfo: "$detailInfo",
            Position: "$Position",
            memberInfo: "$memberInfo",
            files: {
              $map: {
                input: "$files",
                as: "f",
                in: {
                  _id: "$$f._id",
                  title: "$$f.title",
                  summary: "$$f.summary",
                  category: { $arrayElemAt: ["$categoryInfo.category", 0] },
                  createdAt: "$$f.createdAt",
                  status: "$$f.status",
                  filePath: "$$f.filePath",
                  resolutionNo: "$$f.ResolutionNo",
                  dateOfResolution: "$$f.dateOfResolution",
                  resolutionNumber: "$$f.resolutionNumber",
                },
              },
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        term_from: "$_id.term_from",
        term_to: "$_id.term_to",
        members: 1,
      },
    },
    { $sort: { term_from: -1 } }
  );

  const AuthorsWithFiles = await SBmember.aggregate(
    aggregationPipeline
  ).allowDiskUse(true);

  // --- Compute counts and paginate per term ---
  const limit = parseInt(req.query.limit) || 9;

  const paginatedTerms = AuthorsWithFiles.map((term) => {
    const termPageQuery = `pageTerm${term.term_from}`;
    const currentPage = parseInt(req.query[termPageQuery]) || 1;

    const totalCount = term.members.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (currentPage - 1) * limit;
    const endIndex = currentPage * limit;
    const membersPaginated = term.members.slice(startIndex, endIndex);

    const membersWithCounts = membersPaginated.map((member) => {
      const files = member.files || [];
      return {
        ...member,
        count: files.length,
        resolutionCount: files.filter((f) => f.category === "Resolution")
          .length,
        ordinanceCount: files.filter((f) => f.category === "Ordinance").length,
      };
    });

    return {
      term_from: term.term_from,
      term_to: term.term_to,
      currentPage,
      totalPages,
      totalCount,
      members: membersWithCounts,
    };
  });

  res.status(200).json({
    status: "success",
    data: paginatedTerms,
  });
});

exports.getFileCloud = AsyncErrorHandler(async (req, res) => {
  const { id } = req.params;

  const file = await Files.findById(id);
  if (!file) {
    console.log("❌ File not found in DB");
    return res.status(404).json({ message: "File not found." });
  }
  console.log("✅ File found in DB:", file.fileName);

  const allowedRoles = ["admin", "officer"];
  const role = req.user?.role;
  if (role && allowedRoles.includes(role.toLowerCase())) {
    const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
    ActivityLog.create({
      type: "REVIEW",
      action: "Accessed a file",
      performedBy: req.user.linkId,
      performedByModel: capitalizedRole,
      file: file._id,
      message: `${capitalizedRole} accessed file: '${file.title || file.fileName}'`,
      level: "info",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).catch((err) => console.error("❌ Activity log failed:", err));
  }
  if (!file.fileUrl) {
    return res.status(500).json({ message: "File URL missing in DB" });
  }

  try {
    const response = await axios.get(file.fileUrl, { responseType: "stream" });
    res.setHeader("Content-Type", response.headers["content-type"] || "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="${file.fileName}"`);
    response.data.pipe(res);
    response.data.on("end", () => console.log("📤 File streamed successfully"));
    response.data.on("error", (err) => console.error("❗ Streaming error:", err));
  } catch (err) {
    console.error("❗ Hostinger streaming failed:", err.message || err);
    if (!res.headersSent) {
      res.status(500).json({ message: "File streaming failed", error: err.message });
    }
  }
});

exports.getFileForPubliCloud = AsyncErrorHandler(async (req, res) => {
  const { id } = req.params;

  const file = await Files.findById(id);
  if (!file) {
    console.log("File not found in DB");
    return res.status(404).json({ message: "File not found." });
  }
  console.log("File found in DB:", file.fileName);

  const allowedRoles = ["admin", "officer"];
  const role = req.user?.role;
  if (role && allowedRoles.includes(role.toLowerCase())) {
    const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
    ActivityLog.create({
      type: "REVIEW",
      action: "Accessed a file",
      performedBy: req.user.linkId,
      performedByModel: capitalizedRole,
      file: file._id,
      message: `${capitalizedRole} accessed file: '${file.title || file.fileName}'`,
      level: "info",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).catch((err) => console.error("Activity log failed:", err));
  }

  // Stream file from Hostinger
  if (!file.fileUrl) {
    return res.status(500).json({ message: "File URL missing in DB" });
  }

  try {
    const response = await axios.get(file.fileUrl, { responseType: "stream" });

    // Set headers dynamically
    res.setHeader("Content-Type", response.headers["content-type"] || "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="${file.fileName}"`);

    // Pipe the remote file stream to the client
    response.data.pipe(res);

    response.data.on("end", () => console.log("File streamed successfully"));
    response.data.on("error", (err) => console.error("Streaming error:", err));
  } catch (err) {
    console.error("Hostinger streaming failed:", err.message || err);
    if (!res.headersSent) {
      res.status(500).json({ message: "File streaming failed", error: err.message });
    }
  }
});

exports.RemoveFiles = AsyncErrorHandler(async (req, res) => {
  try {
    const file = await Files.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ status: "fail", message: "File not found" });
    }

    if (file.fileUrl) {
      try {
        const response = await axios.post(
          "https://tan-kudu-520349.hostingersite.com/delete.php",
          { file: file.fileUrl }
        );

        if (!response.data.success) {
          console.error("Hostinger deletion failed:", response.data.message);
          return res.status(500).json({
            status: "fail",
            message: "Failed to delete file from Hostinger. Database not updated.",
          });
        }
        console.log("File deleted from Hostinger:", file.fileUrl);

      } catch (err) {
        console.error("Hostinger delete failed:", err.message || err);
        return res.status(500).json({
          status: "fail",
          message: "Failed to delete file from Hostinger. Database not updated.",
        });
      }
    }

    // Kung successful ang pag-delete sa Hostinger, magpatuloy sa database operations
    const allowedRoles = ["admin", "officer"];
    const role = req.user?.role?.toLowerCase();
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid user role for activity log." });
    }
    const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);

    await ActivityLog.create({
      type: "DELETE",
      action: "Deleted a DocumentFile",
      performedBy: req.user.linkId,
      performedByModel: capitalizedRole,
      file: file._id,
      message: `File '${file.title}' was deleted.`,
      level: "warning",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await Files.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      message: "File and database record deleted successfully.",
    });

  } catch (err) {
    console.error("Unhandled error in RemoveFiles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

exports.updateFileOfficer = AsyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const { officer } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid file ID",
    });
  }

  // Step 1: Update File
  const updated = await Files.findByIdAndUpdate(
    id,
    { officer, status: "Pending" },
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({
      status: "error",
      message: "File not found.",
    });
  }

  // Step 2: Populate with aggregation and flatten data using $project
  const populatedResult = await Files.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "department",
      },
    },
    { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "officers",
        localField: "officer",
        foreignField: "_id",
        as: "officer",
      },
    },
    { $unwind: { path: "$officer", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "admins",
        localField: "admin",
        foreignField: "_id",
        as: "admin",
      },
    },
    { $unwind: { path: "$admin", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        title: 1,
        summary: 1,
        author: 1,
        fullText: 1,
        fileSize: 1,
        fileUrl: 1,
        fileName: 1,
        status: 1,
        admin: 1,
        tags: 1,
        approverID: 1,
        createdAt: 1,
        updatedAt: 1,
        notes: 1,
        ArchivedStatus: 1,
        departmentID: "$department._id",
        department: "$department.department",
        categoryID: "$category._id",
        category: "$category.category",
        officer: "$officer._id",
        officer_first_name: "$officer.first_name",
        officer_last_name: "$officer.last_name",
        admin_first_name: "$admin.first_name",
        admin_last_name: "$admin.last_name",
      },
    },
  ]);

  const updatedFile = populatedResult[0];
  const fileId = updatedFile._id;
  // Step 3: Send Notification
  const io = req.app.get("io");
  const officerId = officer?.toString();
  const targetUser = global.connectedUsers?.[officerId];

  const messageText = `A new document has been submitted to you. Status: ${updatedFile.status}`;
  const SendMessage = {
    message: messageText,
    data: updatedFile,
    FileId: fileId,
  };

  await Notification.create({
    message: messageText,
    FileId: fileId,
    viewers: [
      {
        user: new mongoose.Types.ObjectId(officerId),
        isRead: false,
        viewedAt: null,
      },
    ],
  });

  if (targetUser) {
    io.to(targetUser.socketId).emit("SentDocumentNotification", SendMessage);
    console.log(
      `📨 Sent document notification to online officer (${officerId})`
    );
  } else {
    console.log(`📭 Officer (${officerId}) is offline. Notification saved.`);
  }

  return res.status(200).json({ status: "success", data: updatedFile });
});

exports.checkDeliveryType = AsyncErrorHandler(async (req, res) => {
  try {
    const { public_id } = req.query;

    const result = await cloudinary.api.resource(public_id, {
      resource_type: "raw",
    });

    return res.status(200).json({
      status: "success",
      delivery_type: result.type,
      access_mode: result.access_mode,
      resource_type: result.resource_type,
    });
  } catch (error) {
    console.error("Cloudinary Admin API Error:", error);
    return res.status(500).json({ status: "fail", message: error.message });
  }
});

exports.getFileById = AsyncErrorHandler(async (req, res) => {
  console.log("getFileById Controller");
  const { id } = req.params;

  const FilesData = await Files.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "admins",
        localField: "admin",
        foreignField: "_id",
        as: "adminInfo",
      },
    },
    {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "departmentInfo",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    {
      $lookup: {
        from: "officers",
        localField: "officer",
        foreignField: "_id",
        as: "officerInfo",
      },
    },
    {
      $lookup: {
        from: "admins",
        localField: "archivedMetadata.archivedBy",
        foreignField: "_id",
        as: "archiverInfo",
      },
    },
    { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$departmentInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$adminInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$officerInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$archiverInfo", preserveNullAndEmptyArrays: true } },

    {
      $project: {
        _id: 1,
        title: 1,
        summary: 1,
        author: 1,
        fullText: 1,
        fileUrl: 1,
        fileName: 1,
        status: 1,
        tags: 1,
        approverID: 1,
        Archived: 1,
        fileSize: 1,
        dateOfResolution: 1,
        resolutionNumber: 1,
        createdAt: 1,
        updatedAt: 1,
        "archivedMetadata.dateArchived": 1,
        "archivedMetadata.notes": 1,
        "archivedMetadata.archivedBy": 1,
        departmentID: "$departmentInfo._id",
        department: "$departmentInfo.department",
        category: "$categoryInfo.category",
        categoryID: "$categoryInfo._id",
        admin: 1,
        admin_first_name: "$adminInfo.first_name",
        admin_last_name: "$adminInfo.last_name",
        archivedBy_first_name: "$archiverInfo.first_name",
        archivedBy_last_name: "$archiverInfo.last_name",
        officer: "$officerInfo._id",
        officer_first_name: "$officerInfo.first_name",
        officer_last_name: "$officerInfo.last_name",
      },
    },
  ]);

  if (!FilesData || FilesData.length === 0) {
    return res.status(404).json({ message: "File not found." });
  }

  res.status(200).json({
    status: "success",
    data: FilesData[0],
  });
});

exports.getFileForArchive = AsyncErrorHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  const { title, tags, status, category, dateFrom, dateTo, archivedStatus } =
    req.query;

  const matchStage = {};

  // ArchivedStatus filter (Active, Delete, For Restore)
  matchStage.ArchivedStatus = archivedStatus || "Active"; // default Active kung walang pinasa

  if (title) {
    matchStage.title = { $regex: title, $options: "i" };
  }

  if (tags) {
    const tagArray = Array.isArray(tags)
      ? tags.map((tag) => tag.trim().toLowerCase())
      : tags.split(",").map((tag) => tag.trim().toLowerCase());

    if (tagArray.length > 0) {
      matchStage.tags = { $in: tagArray };
    }
  }

  if (status) matchStage.status = status;
  if (category) matchStage.category = new mongoose.Types.ObjectId(category);

  if (dateFrom || dateTo) {
    matchStage.createdAt = {};
    if (dateFrom) matchStage.createdAt.$gte = new Date(dateFrom);
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      matchStage.createdAt.$lte = endOfDay;
    }
  }

  // Kunin lahat ng tags para sa kasalukuyang ArchivedStatus
  const activeTagDocs = await Files.aggregate([
    { $match: { ArchivedStatus: matchStage.ArchivedStatus } },
    { $project: { tags: 1 } },
  ]);
  const allActiveTags = Array.from(
    new Set(activeTagDocs.flatMap((doc) => doc.tags || []))
  );

  // Main query with pagination
  const result = await Files.aggregate([
    { $match: matchStage },
    // Lookups
    {
      $lookup: {
        from: "admins",
        localField: "admin",
        foreignField: "_id",
        as: "adminInfo",
      },
    },
    {
      $lookup: {
        from: "sbmembers",
        localField: "author",
        foreignField: "_id",
        as: "authorInfo",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    {
      $lookup: {
        from: "officers",
        localField: "officer",
        foreignField: "_id",
        as: "officerInfo",
      },
    },
    {
      $lookup: {
        from: "admins",
        localField: "archivedMetadata.archivedBy",
        foreignField: "_id",
        as: "archiverInfo",
      },
    },

    // Unwind
    { $unwind: { path: "$authorInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$adminInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$officerInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$archiverInfo", preserveNullAndEmptyArrays: true } },

    { $sort: { createdAt: -1 } },

    // Paginate + count
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              title: 1,
              summary: 1,
              fullText: 1,
              fileUrl: 1,
              fileName: 1,
              status: 1,
              approverID: 1,
              suggestion: 1,
              ArchivedStatus: 1,
              fileSize: 1,
              oldFile: 1,
              tags: 1,
              createdAt: 1,
              dateOfResolution: 1,
              resolutionNumber: 1,
              updatedAt: 1,
              "archivedMetadata.dateArchived": 1,
              "archivedMetadata.notes": 1,
              "archivedMetadata.archivedBy": 1,
              author: {
                $concat: [
                  "$authorInfo.first_name",
                  " ",
                  "$authorInfo.middle_name",
                  " ",
                  "$authorInfo.last_name",
                ],
              },
              departmentID: "$authorInfo._id",
              category: "$categoryInfo.category",
              categoryID: "$categoryInfo._id",
              admin: 1,
              admin_first_name: "$adminInfo.first_name",
              admin_last_name: "$adminInfo.last_name",
              archivedBy_first_name: "$archiverInfo.first_name",
              archivedBy_last_name: "$archiverInfo.last_name",
              officer: "$officerInfo._id",
              officer_first_name: "$officerInfo.first_name",
              officer_last_name: "$officerInfo.last_name",
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ]).allowDiskUse(true);

  const files = result[0].data || [];
  const totalCount = result[0].totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);
  const statusCounts = await Files.aggregate([
    { $group: { _id: "$ArchivedStatus", count: { $sum: 1 } } },
  ]);
  const countsObj = { Active: 0, Delete: 0, "For Restore": 0 };
  statusCounts.forEach((item) => {
    countsObj[item._id] = item.count;
  });

  res.status(200).json({
    status: "success",
    currentPage: page,
    totalPages,
    totalCount,
    results: files.length,
    data: files,
    activeTags: allActiveTags,
    archivedStatusCounts: countsObj,
  });
});

exports.UpdateCloudinaryFile = AsyncErrorHandler(async (req, res) => {
  const { fileId } = req.body;

  if (!fileId || !mongoose.Types.ObjectId.isValid(fileId))
    return res.status(400).json({ error: "Invalid or missing file ID" });

  const existingFile = await Files.findById(fileId);
  if (!existingFile)
    return res.status(404).json({ error: "File not found" });

  existingFile.status = "Approved";
  await existingFile.save();

  const adminUsers = await UserLoginSchema.find({ role: "admin" });
  const io = req.app.get("io");

  const viewersArray = adminUsers
    .filter((adminUser) => mongoose.Types.ObjectId.isValid(adminUser?.linkedId))
    .map((adminUser) => ({
      user: new mongoose.Types.ObjectId(adminUser.linkedId),
      isRead: false,
      viewedAt: null,
    }));

  const messageText = `Document "${existingFile.title}" has been approved.`;
  const SendMessage = {
    message: messageText,
    data: existingFile,
    old: null,
    FileId: existingFile._id,
  };

  await Notification.create({
    message: messageText,
    viewers: viewersArray,
    FileId: existingFile._id,
  });

  adminUsers.forEach((adminUser) => {
    if (!adminUser?.linkedId) return;
    const adminId = adminUser.linkedId.toString();
    const targetUser = global.connectedUsers?.[adminId];
    if (targetUser) {
      io.to(targetUser.socketId).emit("SentNewDocuNotification", SendMessage);
    }
  });

  res.status(200).json({
    status: "success",
    message: "File status updated to approved.",
    data: existingFile,
  });
});


exports.getOfficer = AsyncErrorHandler(async (req, res) => {
  const officerId = req.user.linkId;
  const limit = parseInt(req.query.limit) || 5;
  const pagePending = parseInt(req.query.pagePending) || 1;
  const pageApproved = parseInt(req.query.pageApproved) || 1;
  const pageRejected = parseInt(req.query.pageRejected) || 1;

  const skipPending = (pagePending - 1) * limit;
  const skipApproved = (pageApproved - 1) * limit;
  const skipRejected = (pageRejected - 1) * limit;

  const lookupStages = [
    {
      $lookup: {
        from: "admins",
        localField: "admin",
        foreignField: "_id",
        as: "adminInfo",
      },
    },
    {
      $lookup: {
        from: "sbmembers",
        localField: "author",
        foreignField: "_id",
        as: "sbmemberInfo",
      },
    },
    {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "departmentInfo",
      },
    },
    {
      $lookup: {
        from: "officers",
        localField: "officer",
        foreignField: "_id",
        as: "officerInfo",
      },
    },
    {
      $lookup: {
        from: "admins",
        localField: "archivedMetadata.archivedBy",
        foreignField: "_id",
        as: "archiverInfo",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    { $unwind: { path: "$sbmemberInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$departmentInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$adminInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$officerInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$archiverInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        title: 1,
        summary: 1,
        fullText: 1,
        fileUrl: 1,
        fileName: 1,
        status: 1,
        admin: 1,
        suggestion: 1,
        tags: 1,
        district: 1,
        detailInfo: 1,
        ArchivedStatus: 1,
        createdAt: 1,
        updatedAt: 1,
        dateOfResolution: 1,
        resolutionNumber: 1,
        approverID: 1,
        fileSize: 1,
        "archivedMetadata.dateArchived": 1,
        "archivedMetadata.notes": 1,
        "archivedMetadata.archivedBy": 1,
        department: "$departmentInfo.department",
        departmentID: "$departmentInfo._id",
        category: "$categoryInfo.category",
        categoryID: "$categoryInfo._id",
        category: "$categoryInfo.category",
        author: "$sbmemberInfo._id",
        authorName: {
          $concat: ["$sbmemberInfo.first_name", " ", "$sbmemberInfo.last_name"],
        },
        admin_last_name: "$adminInfo.last_name",
        archivedBy_first_name: "$archiverInfo.first_name",
        archivedBy_last_name: "$archiverInfo.last_name",
        officer: "$officerInfo._id",
        officer_first_name: "$officerInfo.first_name",
        officer_last_name: "$officerInfo.last_name",
      },
    },
  ];

  const FilesData = await Files.aggregate([
    {
      $match: {
        $or: [
          { officer: new mongoose.Types.ObjectId(officerId) },
          { approverID: new mongoose.Types.ObjectId(officerId) },
          { author: new mongoose.Types.ObjectId(officerId) },
        ],
        ArchivedStatus: "Active",
      },
    },
    {
      $facet: {
        pending: [
          { $match: { status: "Pending" } },
          { $sort: { createdAt: -1 } },
          { $skip: skipPending },
          { $limit: limit },
          ...lookupStages,
        ],
        approved: [
          { $match: { status: "Approved" } },
          { $sort: { createdAt: -1 } },
          { $skip: skipApproved },
          { $limit: limit },
          ...lookupStages,
        ],
        rejected: [
          { $match: { status: "Rejected" } },
          { $sort: { createdAt: -1 } },
          { $skip: skipRejected },
          { $limit: limit },
          ...lookupStages,
        ],
        recentData: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          ...lookupStages,
        ],
        counts: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ],
        totalFileSize: [
          {
            $group: {
              _id: null,
              totalSize: { $sum: "$fileSize" },
            },
          },
        ],
      },
    },
  ]).allowDiskUse(true);

  const result = FilesData[0] || {};
  const pendingFiles = result.pending || [];
  const approvedFiles = result.approved || [];
  const rejectedFiles = result.rejected || [];
  const recentDataFiles = result.recentData || [];

  const countPending =
    result.counts.find((c) => c._id === "Pending")?.count || 0;
  const countApproved =
    result.counts.find((c) => c._id === "Approved")?.count || 0;
  const countRejected =
    result.counts.find((c) => c._id === "Rejected")?.count || 0;

  const totalFileSize = result.totalFileSize[0]?.totalSize || 0;

  res.status(200).json({
    status: "success",
    recentData: recentDataFiles,
    pending: pendingFiles,
    approved: approvedFiles,
    rejected: rejectedFiles,
    counts: {
      pending: countPending,
      approved: countApproved,
      rejected: countRejected,
      totalFileSize: totalFileSize,
    },
    totalPages: {
      pending: Math.ceil(countPending / limit),
      approved: Math.ceil(countApproved / limit),
      rejected: Math.ceil(countRejected / limit),
    },
    currentPage: {
      pending: pagePending,
      approved: pageApproved,
      rejected: pageRejected,
    },
  });
});

exports.PublicDisplayController = AsyncErrorHandler(async (req, res, next) => {
  try {
    const FilesData = await Files.aggregate([
      {
        $match: {
          $and: [
            { status: "Approved" },
            {
              $or: [
                { ArchivedStatus: "Active" },
                { ArchivedStatus: "Archived" },
              ],
            },
          ],
        },
      },
      {
        $lookup: {
          from: "admins",
          localField: "admin",
          foreignField: "_id",
          as: "adminInfo",
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "departmentInfo",
        },
      },
      {
        $lookup: {
          from: "officers",
          localField: "officer",
          foreignField: "_id",
          as: "officerInfo",
        },
      },
      {
        $lookup: {
          from: "sbmembers",
          localField: "author",
          foreignField: "_id",
          as: "authorInfo",
        },
      },
      {
        $addFields: {
          archivedById: {
            $cond: {
              if: { $gt: ["$archivedMetadata", null] },
              then: "$archivedMetadata.archivedBy",
              else: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: "admins",
          localField: "archivedById",
          foreignField: "_id",
          as: "archiverInfo",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: { path: "$authorInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
      {
        $unwind: { path: "$departmentInfo", preserveNullAndEmptyArrays: true },
      },
      { $unwind: { path: "$adminInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$officerInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$archiverInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          summary: 1,
          author: 1,
          fullText: 1,
          fileUrl: 1,
          fileName: 1,
          status: 1,
          tags: 1,
          ArchivedStatus: 1,
          dateOfResolution: 1,
          resolutionNumber: 1,
          createdAt: 1,
          updatedAt: 1,
          "archivedMetadata.dateArchived": 1,
          "archivedMetadata.notes": 1,
          "archivedMetadata.archivedBy": 1,
          department: "$departmentInfo.department",
          departmentID: "$departmentInfo._id",
          category: "$categoryInfo.category",
          categoryID: "$categoryInfo._id",
          author: {
            $concat: [
              "$authorInfo.first_name",
              " ",
              { $ifNull: ["$authorInfo.middle_name", ""] },
              " ",
              "$authorInfo.last_name",
            ],
          },
          authorID: "$authorInfo._id",
          admin: 1,
          admin_first_name: "$adminInfo.first_name",
          admin_last_name: "$adminInfo.last_name",
          archivedBy_first_name: "$archiverInfo.first_name",
          archivedBy_last_name: "$archiverInfo.last_name",
          officer: "$officerInfo._id",
          officer_first_name: "$officerInfo.first_name",
          officer_last_name: "$officerInfo.last_name",
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: FilesData,
    });
  } catch (error) {
    console.error("Error in PublicDisplayController:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
      stackTrace: error.stack,
    });
  }
});

exports.DisplayFilesArchive = AsyncErrorHandler(async (req, res) => {
  const defaultLimit = parseInt(req.query.limit) || 9;
  let pagePerCategory = {};
  try {
    pagePerCategory = req.query.page ? JSON.parse(req.query.page) : {};
  } catch (err) {
    console.warn("Invalid page object, defaulting to 1 per category");
  }

  const {
    title,
    tags,
    status,
    category,
    dateFrom,
    dateTo,
    ArchivedStatus,
    oldFile,
    search,
  } = req.query;

  const matchStage = {};
  if (ArchivedStatus) matchStage.ArchivedStatus = ArchivedStatus;
  if (status) matchStage.status = status;
  if (oldFile !== undefined) matchStage.oldFile = oldFile === "true";

  if (title) {
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    matchStage.title = { $regex: escapedTitle, $options: "i" };
  }

  if (tags) {
    const tagArray = Array.isArray(tags)
      ? tags.map((t) => t.trim().toLowerCase())
      : tags.split(",").map((t) => t.trim().toLowerCase());
    if (tagArray.length > 0) matchStage.tags = { $in: tagArray };
  }

  if (category) matchStage.category = new mongoose.Types.ObjectId(category);

  if (dateFrom || dateTo) {
    matchStage.createdAt = {};
    if (dateFrom) matchStage.createdAt.$gte = new Date(dateFrom);
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      matchStage.createdAt.$lte = endOfDay;
    }
  }

  // --- Kunin lahat ng files at unwind lookups ---
  let files = await Files.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "admins",
        localField: "admin",
        foreignField: "_id",
        as: "adminInfo",
      },
    },
    {
      $lookup: {
        from: "sbmembers",
        localField: "author",
        foreignField: "_id",
        as: "authorInfo",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    {
      $lookup: {
        from: "officers",
        localField: "officer",
        foreignField: "_id",
        as: "officerInfo",
      },
    },
    {
      $lookup: {
        from: "admins",
        localField: "archivedMetadata.archivedBy",
        foreignField: "_id",
        as: "archiverInfo",
      },
    },
    { $unwind: { path: "$authorInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$adminInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$officerInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$archiverInfo", preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } },
  ]).allowDiskUse(true);

  // --- Optional search filter ---
  if (search) {
    const regex = new RegExp(search, "i");
    files = files.filter(
      (f) =>
        regex.test(f.title) ||
        regex.test(f.summary || "") ||
        regex.test(f.tags?.join(",") || "") ||
        regex.test(
          `${f.authorInfo?.first_name || ""} ${f.authorInfo?.last_name || ""}`
        )
    );
  }

  // --- Paginate files per category ---
  const filesByCategory = {};
  files.forEach((file) => {
    const catId = file.categoryInfo?._id?.toString() || "uncategorized";
    if (!filesByCategory[catId]) filesByCategory[catId] = [];
    filesByCategory[catId].push(file);
  });

  // --- Kunin ActiveTags per category ---
  const activeTagsPerCategory = {};
  for (const [catId, catFiles] of Object.entries(filesByCategory)) {
    activeTagsPerCategory[catId] = Array.from(
      new Set(catFiles.flatMap((f) => f.tags || []))
    );
  }

  const result = Object.entries(filesByCategory).map(([catId, catFiles]) => {
    const page =
      category && catId === category
        ? parseInt(req.query.page) || 1
        : pagePerCategory[catId] || 1;

    const start = (page - 1) * defaultLimit;
    const paginatedFiles = catFiles.slice(start, start + defaultLimit);

    return {
      categoryId: catId,
      categoryName: catFiles[0]?.categoryInfo?.category || "Uncategorized",
      totalFiles: catFiles.length,
      totalPages: Math.ceil(catFiles.length / defaultLimit),
      currentPage: page,
      files: paginatedFiles.map((f) => ({
        _id: f._id,
        title: f.title,
        summary: f.summary,
        fileUrl: f.fileUrl,
        fileName: f.fileName,
        status: f.status,
        ArchivedStatus: f.ArchivedStatus,
        oldFile: f.oldFile,
        tags: f.tags,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
        author: `${f.authorInfo?.first_name || ""} ${
          f.authorInfo?.middle_name || ""
        } ${f.authorInfo?.last_name || ""}`.trim(),
        category: f.categoryInfo?.category,
        categoryID: f.categoryInfo?._id,
        admin_first_name: f.adminInfo?.first_name,
        admin_last_name: f.adminInfo?.last_name,
        archivedBy_first_name: f.archiverInfo?.first_name,
        archivedBy_last_name: f.archiverInfo?.last_name,
        officer_first_name: f.officerInfo?.first_name,
        officer_last_name: f.officerInfo?.last_name,
      })),
      activeTags: activeTagsPerCategory[catId], // <-- lahat ng tags per category
    };
  });

  const totalCounts = await Files.aggregate([
    {
      $facet: {
        deleted: [
          { $match: { ArchivedStatus: "Deleted" } },
          { $count: "count" },
        ],
        forRestore: [
          { $match: { ArchivedStatus: "For Restore" } },
          { $count: "count" },
        ],
        archived: [
          { $match: { ArchivedStatus: "Archived" } },
          { $count: "count" },
        ],
        public: [
          { $match: { ArchivedStatus: "Active", status: "Approved" } },
          { $count: "count" },
        ],
      },
    },
    {
      $project: {
        deleted: { $ifNull: [{ $arrayElemAt: ["$deleted.count", 0] }, 0] },
        forRestore: {
          $ifNull: [{ $arrayElemAt: ["$forRestore.count", 0] }, 0],
        },
        archived: { $ifNull: [{ $arrayElemAt: ["$archived.count", 0] }, 0] },
        public: { $ifNull: [{ $arrayElemAt: ["$public.count", 0] }, 0] },
      },
    },
  ]);

  const counts = totalCounts[0] || {
    deleted: 0,
    forRestore: 0,
    archived: 0,
    public: 0,
  };

  res.status(200).json({
    status: "success",
    data: result,
    counts,
  });
});

exports.DisplayDocumentPerYear = AsyncErrorHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;

  const { year, title, tags, category, oldFile, sort } = req.query;
  const matchStage = { status: "Approved", ArchivedStatus: "Active" };

  if (oldFile !== undefined) matchStage.oldFile = oldFile === "true";

  if (title) {
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    matchStage.title = { $regex: escapedTitle, $options: "i" };
  }

  if (tags) {
    const tagArray = Array.isArray(tags)
      ? tags.map((t) => t.trim().toLowerCase())
      : tags.split(",").map((t) => t.trim().toLowerCase());
    if (tagArray.length > 0) matchStage.tags = { $in: tagArray };
  }

  if (category) matchStage.category = new mongoose.Types.ObjectId(category);

  // --- Single year search ---
  if (year) {
    matchStage.dateOfResolution = {
      $gte: new Date(`${year}-01-01T00:00:00.000Z`),
      $lte: new Date(`${year}-12-31T23:59:59.999Z`),
    };

    const totalCount = await Files.countDocuments(matchStage);
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    const files = await Files.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "admins",
          localField: "admin",
          foreignField: "_id",
          as: "adminInfo",
        },
      },
      {
        $lookup: {
          from: "sbmembers",
          localField: "author",
          foreignField: "_id",
          as: "authorInfo",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      {
        $lookup: {
          from: "officers",
          localField: "officer",
          foreignField: "_id",
          as: "officerInfo",
        },
      },
      {
        $lookup: {
          from: "admins",
          localField: "archivedMetadata.archivedBy",
          foreignField: "_id",
          as: "archiverInfo",
        },
      },
      { $unwind: { path: "$authorInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$adminInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$officerInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$archiverInfo", preserveNullAndEmptyArrays: true } },
      { $sort: { dateOfResolution: sort === "asc" ? 1 : -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const formattedFiles = files.map((f) => ({
      _id: f._id,
      title: f.title,
      summary: f.summary,
      fileUrl: f.fileUrl,
      fileName: f.fileName,
      status: f.status,
      ArchivedStatus: f.ArchivedStatus,
      oldFile: f.oldFile,
      tags: f.tags,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      author: `${f.authorInfo?.first_name || ""} ${
        f.authorInfo?.middle_name || ""
      } ${f.authorInfo?.last_name || ""}`.trim(),
      category: f.categoryInfo?.category,
      categoryID: f.categoryInfo?._id,
      admin_first_name: f.adminInfo?.first_name,
      admin_last_name: f.adminInfo?.last_name,
      archivedBy_first_name: f.archiverInfo?.first_name,
      archivedBy_last_name: f.archiverInfo?.last_name,
      officer_first_name: f.officerInfo?.first_name,
      officer_last_name: f.officerInfo?.last_name,
    }));

    return res.status(200).json({
      status: "success",
      year,
      currentPage: page,
      totalPages,
      totalCount,
      results: formattedFiles.length,
      data: formattedFiles,
    });
  }

  // --- All years search with total count per year ---
  const yearCounts = await Files.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $year: "$dateOfResolution" },
        totalDocuments: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  const results = [];

  for (const { _id: y, totalDocuments } of yearCounts) {
    const yearMatch = {
      ...matchStage,
      dateOfResolution: {
        $gte: new Date(`${y}-01-01T00:00:00.000Z`),
        $lte: new Date(`${y}-12-31T23:59:59.999Z`),
      },
    };

    const skip = (page - 1) * limit;

    const files = await Files.aggregate([
      { $match: yearMatch },
      {
        $lookup: {
          from: "admins",
          localField: "admin",
          foreignField: "_id",
          as: "adminInfo",
        },
      },
      {
        $lookup: {
          from: "sbmembers",
          localField: "author",
          foreignField: "_id",
          as: "authorInfo",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      {
        $lookup: {
          from: "officers",
          localField: "officer",
          foreignField: "_id",
          as: "officerInfo",
        },
      },
      {
        $lookup: {
          from: "admins",
          localField: "archivedMetadata.archivedBy",
          foreignField: "_id",
          as: "archiverInfo",
        },
      },
      { $unwind: { path: "$authorInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$adminInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$officerInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$archiverInfo", preserveNullAndEmptyArrays: true } },
      { $sort: { dateOfResolution: sort === "asc" ? 1 : -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const formattedFiles = files.map((f) => ({
      _id: f._id,
      title: f.title,
      summary: f.summary,
      fileUrl: f.fileUrl,
      fileName: f.fileName,
      status: f.status,
      ArchivedStatus: f.ArchivedStatus,
      oldFile: f.oldFile,
      tags: f.tags,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      author: `${f.authorInfo?.first_name || ""} ${
        f.authorInfo?.middle_name || ""
      } ${f.authorInfo?.last_name || ""}`.trim(),
      category: f.categoryInfo?.category,
      categoryID: f.categoryInfo?._id,
      admin_first_name: f.adminInfo?.first_name,
      admin_last_name: f.adminInfo?.last_name,
      archivedBy_first_name: f.archiverInfo?.first_name,
      archivedBy_last_name: f.archiverInfo?.last_name,
      officer_first_name: f.officerInfo?.first_name,
      officer_last_name: f.officerInfo?.last_name,
    }));

    results.push({
      status: "success",
      year: y.toString(),
      totalCount: totalDocuments, // <-- total count per year
      currentPage: page,
      results: formattedFiles.length,
      data: formattedFiles,
    });
  }

  res.status(200).json(results);
});

exports.PublicGetAuthorwithFiles = AsyncErrorHandler(async (req, res, next) => {
  const { search, district, detailInfo, Position, term_from, term_to } =
    req.query;
  const aggregationPipeline = [];

  const matchStage = {};

  if (district) matchStage.district = district;
  if (detailInfo) matchStage.detailInfo = detailInfo;
  if (Position) matchStage.Position = Position;

  const currentYear = new Date().getFullYear();
  const fromYear = term_from ? parseInt(term_from) : currentYear;
  const toYear = term_to ? parseInt(term_to) : undefined;

  if (fromYear && toYear) {
    matchStage.term_from = fromYear;
    matchStage.term_to = toYear;
  } else if (fromYear) {
    matchStage.term_from = fromYear;
  }

  if (Object.keys(matchStage).length > 0) {
    aggregationPipeline.push({ $match: matchStage });
  }

  aggregationPipeline.push(
    {
      $lookup: {
        from: "files",
        let: { authorId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$author", "$$authorId"] },
                  { $eq: ["$status", "Approved"] },
                  {
                    $or: [
                      { $eq: ["$ArchivedStatus", "Archived"] },
                      { $eq: ["$ArchivedStatus", "Active"] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: "files",
      },
    },
    { $unwind: { path: "$files", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "categories",
        localField: "files.category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        fullName: {
          $concat: [
            "$first_name",
            " ",
            { $ifNull: ["$middle_name", ""] },
            " ",
            "$last_name",
          ],
        },
        "files.categoryName": "$categoryInfo.category",
      },
    }
  );

  // Search filter
  if (search) {
    aggregationPipeline.push({
      $match: {
        $or: [
          { first_name: { $regex: search, $options: "i" } },
          { middle_name: { $regex: search, $options: "i" } },
          { last_name: { $regex: search, $options: "i" } },
          { fullName: { $regex: search, $options: "i" } },
          { "files.title": { $regex: search, $options: "i" } },
          { Position: { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  // Group results
  aggregationPipeline.push(
    {
      $group: {
        _id: "$_id",
        fullName: { $first: "$fullName" },
        district: { $first: "$district" },
        detailInfo: { $first: "$detailInfo" },
        Position: { $first: "$Position" },
        term_from: { $first: "$term_from" },
        term_to: { $first: "$term_to" },
        memberInfo: { $first: "$$ROOT" },
        files: {
          $push: {
            $cond: [
              { $ne: ["$files._id", null] },
              {
                _id: "$files._id",
                title: "$files.title",
                summary: "$files.summary",
                category: "$categoryInfo.category",
                createdAt: "$files.createdAt",
                status: "$files.status",
                filePath: "$files.filePath",
                resolutionNo: "$files.ResolutionNo",
                dateOfResolution: "$files.dateOfResolution",
                resolutionNumber: "$files.resolutionNumber",
              },
              "$$REMOVE",
            ],
          },
        },
        count: { $sum: { $cond: [{ $ifNull: ["$files._id", false] }, 1, 0] } },
        resolutionCount: {
          $sum: {
            $cond: [{ $eq: ["$categoryInfo.category", "Resolution"] }, 1, 0],
          },
        },
        ordinanceCount: {
          $sum: {
            $cond: [{ $eq: ["$categoryInfo.category", "Ordinance"] }, 1, 0],
          },
        },
      },
    },
    { $sort: { fullName: 1 } }
  );

  const AuthorsWithFiles = await SBmember.aggregate(
    aggregationPipeline
  ).allowDiskUse(true);
  const totalCount = AuthorsWithFiles.length;
  const limit = parseInt(req.query.limit) || 20;
  const currentPage = parseInt(req.query.page) || 1;
  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = (currentPage - 1) * limit;
  const endIndex = currentPage * limit;
  const paginatedData = AuthorsWithFiles.slice(startIndex, endIndex);

  res.status(200).json({
    status: "success",
    currentPage,
    totalPages,
    data: paginatedData,
  });
});
