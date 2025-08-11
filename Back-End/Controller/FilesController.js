const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Files = require("../Models/File");
const path = require("path");
const cloudinary = require("../Utils/cloudinary");
const streamifier = require("streamifier");
const mongoose = require("mongoose");
const axios = require("axios");
const ActivityLog = require("./../Models/LogActionAudit");
const Notification = require("../Models/NotificationSchema");
const UserLoginSchema = require("../Models/LogInDentalSchema");
const SBmember = require("../Models/SBmember");

const sanitizeFolderName = (name) => {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .trim();
};

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

exports.createFiles = AsyncErrorHandler(async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const {
      title,
      category,
      summary,
      author,
      admin,
      archived,
      resolutionNumber,
      dateOfResolution,
      approverID,
      status = "Pending",
    } = req.body;

    console.log("File creation request body:", req.body);

    if (!title || !admin || !category)
      return res.status(400).json({ error: "Missing required fields" });

    if (!mongoose.Types.ObjectId.isValid(admin))
      return res.status(400).json({ error: "Invalid admin ID format" });

    if (approverID && !mongoose.Types.ObjectId.isValid(approverID)) {
      return res.status(400).json({ error: "Invalid approver ID format" });
    }
    const ext = path.extname(req.file.originalname);
    const baseName = path.basename(req.file.originalname, ext);
    const fileName = `${Date.now()}_${baseName}${ext}`;
    const folderPath = `Government Archiving/${sanitizeFolderName(category)}`;

    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: folderPath,
            resource_type: "raw",
            public_id: fileName.replace(ext, ""),
            use_filename: true,
            unique_filename: false,
            access_mode: "public",
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    let result;
    try {
      result = await streamUpload();
      console.log("File uploaded to Cloudinary:", result.secure_url);
    } catch (uploadErr) {
      console.error("Cloudinary upload failed:", uploadErr);
      return res.status(500).json({ error: "File upload failed" });
    }

    const typeMap = {
      ".pdf": "PDF",
      ".doc": "Word Document",
      ".docx": "Word Document",
      ".xls": "Excel Spreadsheet",
      ".xlsx": "Excel Spreadsheet",
      ".ppt": "PowerPoint Presentation",
      ".pptx": "PowerPoint Presentation",
      ".jpg": "Image",
      ".jpeg": "Image",
      ".png": "Image",
      ".txt": "Text",
      ".zip": "ZIP",
      ".csv": "CSV",
    };

    const fullTextType = typeMap[ext.toLowerCase()] || "Unknown";
    const fileSize = req.file.size;

    const newFile = new Files({
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
      fileUrl: result.secure_url,
      fileName,
      folderPath,
      fullText: fullTextType,
      Archived: archived === "true",
    });

    let savedFile;
    try {
      savedFile = await newFile.save();
      console.log("File saved to database:", savedFile._id);
    } catch (dbErr) {
      console.error("Database save error:", dbErr);
      return res.status(500).json({ error: "Failed to save file to database" });
    }

    const allowedRoles = ["admin", "officer"];
    const role = req.user?.role?.toLowerCase();
    const capitalizedRole = role?.charAt(0).toUpperCase() + role?.slice(1);

    const logPromise =
      allowedRoles.includes(role) && savedFile
        ? ActivityLog.create({
            type: "CREATE",
            action: "Uploaded a new file",
            performedBy: req.user.linkId,
            performedByModel: capitalizedRole,
            file: savedFile._id,
            message: `${capitalizedRole} uploaded file: '${title}'`,
            level: "info",
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
          })
        : Promise.resolve();

    const enrichmentPromise = Files.aggregate([
      { $match: { _id: savedFile._id } },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      {
        $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          title: 1,
          summary: 1,
          author: 1,
          fileUrl: 1,
          fileName: 1,
          folderPath: 1,
          approverID: 1,
          fullText: 1,
          Archived: 1,
          createdAt: 1,
          fileSize: 1,
          updatedAt: 1,
          departmentId: { $arrayElemAt: ["$departmentInfo._id", 0] },
          category: "$categoryInfo.category",
          categoryID: "$categoryInfo._id",
          status: 1,
          approverID: 1,
        },
      },
    ]);

    const [_, enrichedFileResult] = await Promise.all([
      logPromise,
      enrichmentPromise,
    ]);
    const enrichedFile = enrichedFileResult[0];
    if (savedFile.status === "Pending") {
      console.log("Creating notification for Pending file");
      const fileId = savedFile._id;
      const fileTitle = savedFile.title || "Untitled Document";
      const categoryTitle = enrichedFile.category || "Unknown Category";

      const messageText = `New document pending your approval: "${fileTitle}" from ${categoryTitle}`;

      const targetViewer =
        approverID && mongoose.Types.ObjectId.isValid(approverID)
          ? approverID
          : author;

      try {
        if (!mongoose.Types.ObjectId.isValid(targetViewer)) {
          console.log("Invalid target viewer ID, skipping notification");
        } else {
          const viewersArray = [
            {
              user: targetViewer,
              isRead: false,
              isApprover: !!approverID, // true if approverID exists
            },
          ];

          const notificationDoc = await Notification.create({
            message: messageText,
            viewers: viewersArray,
            FileId: fileId,
            relatedApprover: approverID, // this can still be null
          });

          console.log("Notification created:", notificationDoc._id);

          const io = req.app.get("io");
          if (io) {
            const SendMessage = {
              message: messageText,
              data: enrichedFile,
              notificationId: notificationDoc._id,
              FileId: fileId,
              approverID: approverID,
            };

            const receiver = global.connectedUsers?.[targetViewer];
            if (receiver) {
              io.to(receiver.socketId).emit(
                "SentDocumentNotification",
                SendMessage
              );
              console.log(
                `📨 Sent real-time notification to USER (${targetViewer})`
              );
            } else {
              console.log(
                `📭 User (${targetViewer}) is OFFLINE - notification saved in DB`
              );
            }
          } else {
            console.warn("Socket.io instance not available");
          }
        }
      } catch (error) {
        console.error("Notification creation failed:", error.message);
      }
    }

    res.status(201).json({
      status: "success",
      data: enrichedFile,
    });
  } catch (err) {
    console.error("Unhandled error in createFiles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

exports.DisplayFiles = AsyncErrorHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  console.log("DisplayFiles Controller")

  const { title, tags, status, category, dateFrom, dateTo } = req.query;

  const matchStage = {
    ArchivedStatus: "Active", // <--- IMPORTANT!
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
  });

  res.status(200).json({
    status: "success",
    currentPage: page,
    totalPages,
    totalCount,
    totalDocumentsToday,
    results: files.length,
    data: files,
    activeTags: allActiveTags,
  });
});

exports.getAllAuthorsWithFiles = AsyncErrorHandler(async (req, res, next) => {
  const { search, district, detailInfo } = req.query;

  
  console.log("getAllAuthorsWithFiles Controller")

  const aggregationPipeline = [];

  const matchStage = {};
  if (district) {
    matchStage.district = district;
  }
  if (detailInfo) {
    matchStage.detailInfo = detailInfo;
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
    {
      $unwind: {
        path: "$files",
        preserveNullAndEmptyArrays: true,
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
      $unwind: {
        path: "$categoryInfo",
        preserveNullAndEmptyArrays: true,
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
        "files.categoryName": "$categoryInfo.category",
      },
    }
  );

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

  aggregationPipeline.push(
    {
      $group: {
        _id: "$_id",
        fullName: { $first: "$fullName" },
        district: { $first: "$district" },
        detailInfo: { $first: "$detailInfo" },
        Position: { $first: "$Position" },
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
    {
      $sort: { fullName: 1 },
    }
  );

  const AuthorsWithFiles = await SBmember.aggregate(
    aggregationPipeline
  ).allowDiskUse(true);

  const totalCount = AuthorsWithFiles.length;
  const limit = parseInt(req.query.limit) || 6;
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

exports.getFileCloud = AsyncErrorHandler(async (req, res) => {
  try {

    const { id } = req.params;
    const file = await Files.findById(id);
    if (!file) return res.status(404).json({ message: "File not found." });

    const cloudinaryUrl = file.fileUrl;

    const allowedRoles = ["admin", "officer"];
    const role = req.user?.role;
    if (role && allowedRoles.includes(role.toLowerCase())) {
      const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);

      await ActivityLog.create({
        type: "REVIEW",
        action: "Accessed a file",
        performedBy: req.user.linkId,
        performedByModel: capitalizedRole,
        file: file._id,
        message: `${capitalizedRole} accessed file: '${
          file.title || file.fileName
        }'`,
        level: "info",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
    }

    // Proceed with streaming regardless of role
    const response = await axios({
      method: "GET",
      url: cloudinaryUrl,
      responseType: "stream",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${file.fileName}"`);
    return response.data.pipe(res);
  } catch (error) {
    console.error("Cloudinary streaming failed:", error.message);
    res.status(error.response?.status || 500).json({
      message: "Cloudinary streaming failed",
      error: error.message,
    });
  }
});

exports.getFileForPubliCloud = AsyncErrorHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const file = await Files.findById(id);
    if (!file) return res.status(404).json({ message: "File not found." });
    return res.redirect(file.fileUrl);
  } catch (error) {
    console.error("Redirect to Cloudinary failed:", error.message);
    res.status(500).json({
      message: "Error redirecting to Cloudinary",
      error: error.message,
    });
  }
});

exports.RemoveFiles = AsyncErrorHandler(async (req, res) => {
  const file = await Files.findById(req.params.id);
  if (!file)
    return res.status(404).json({ status: "fail", message: "File not found" });

  // Get department ID as folder name
  const department =
    typeof file.department === "object" && file.department !== null
      ? file.department._id || file.department.id
      : file.department;

  // Remove file extension from filename
  const ext = path.extname(file.fileName);
  const baseFileName = file.fileName.replace(ext, "");

  // Final Cloudinary public ID
  const publicId = `Government Archiving/${department}/${baseFileName}`;
  console.log("Deleting from Cloudinary:", publicId);

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw", // or "auto" if needed
    });

    if (result.result !== "ok") {
      console.warn("Cloudinary destroy failed:", result);
    }

    const allowedRoles = ["admin", "officer"];
    const role = req.user.role.toLowerCase();

    if (!allowedRoles.includes(role)) {
      return res
        .status(400)
        .json({ error: "Invalid user role for activity log." });
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
      message: "File deleted successfully.",
    });
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    res.status(500).json({ status: "fail", message: "Failed to delete file." });
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

       console.log("getFileById Controller")
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

exports.UpdateCloudinaryFile = AsyncErrorHandler(async (req, res) => {
  const { file } = req;
  const {
    fileId,
    title,
    summary,
    author,
    admin,
    status,
    officer,
    category,
    approverID,
    dateOfResolution,
  } = req.body;

  console.log("📥 Body received:", req.body);

  if (!file) return res.status(400).json({ error: "No file uploaded" });

  if (!fileId || !mongoose.Types.ObjectId.isValid(fileId))
    return res.status(400).json({ error: "Invalid or missing file ID" });

  if (!title || !admin)
    return res.status(400).json({ error: "Missing required fields" });

  if (!mongoose.Types.ObjectId.isValid(admin))
    return res.status(400).json({ error: "Invalid admin ID format" });

  const oldFile = await Files.findByIdAndUpdate(
    fileId,
    {
      ArchivedStatus: "Archived",
      archivedMetadata: {
        dateArchived: new Date(),
        archivedBy: admin,
        notes: "Archived due to update",
      },
    },
    { new: true }
  );

  if (!oldFile)
    return res.status(404).json({ error: "Original file not found" });
  const ext = path.extname(file.originalname || ".pdf");
  const baseName = path.basename(file.originalname || "document.pdf", ext);
  const fileName = `${Date.now()}_${baseName}${ext}`;
  const folderPath = `Government Archiving/${sanitizeFolderName(category)}`;

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderPath,
        resource_type: "raw",
        public_id: fileName.replace(ext, ""),
        use_filename: true,
        unique_filename: false,
        access_mode: "public",
      },
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary error:", error);
          reject(error);
        } else {
          console.log("✅ Cloudinary upload result:", result?.secure_url);
          resolve(result);
        }
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });

  const typeMap = { ".pdf": "PDF" };
  const fullTextType = typeMap[ext.toLowerCase()] || "Unknown";

  const newFile = await new Files({
    title,
    category,
    summary,
    author,
    admin,
    officer,
    fileUrl: result?.secure_url,
    fileName,
    folderPath,
    fullText: fullTextType,
    status,
    approverID,
    dateOfResolution,
  }).save();

  // Aggregate and populate new file
  const populatedFileResult = await Files.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(newFile._id) } },
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
        tags: 1,
        notes: 1,
        createdAt: 1,
        dateOfResolution: 1,
        updatedAt: 1,
        approverID: 1,
        ArchivedStatus: 1,
        categoryID: "$category._id",
        category: "$category.category",
        officer: "$officer._id",
        officer_first_name: "$officer.first_name",
        officer_last_name: "$officer.last_name",
        admin: 1,
        admin_first_name: "$admin.first_name",
        admin_last_name: "$admin.last_name",
      },
    },
  ]);

  const finalFile = populatedFileResult[0];
  const adminUsers = await UserLoginSchema.find({ role: "admin" });
  const io = req.app.get("io");

  const viewersArray = adminUsers
    .filter((adminUser) => mongoose.Types.ObjectId.isValid(adminUser?.linkedId))
    .map((adminUser) => ({
      user: new mongoose.Types.ObjectId(adminUser.linkedId),
      isRead: false,
      viewedAt: null,
    }));

  const messageText = `A new document has been submitted. Status: ${finalFile.status}`;
  const SendMessage = {
    message: messageText,
    data: finalFile,
    old: oldFile,
    FileId: newFile._id,
  };

  await Notification.create({
    message: messageText,
    viewers: viewersArray,
    FileId: newFile._id,
  });

  adminUsers.forEach((adminUser) => {
    if (!adminUser?.linkedId) {
      console.warn(
        "⚠️ Skipping admin with missing linkedId:",
        adminUser.username
      );
      return;
    }

    const adminId = adminUser.linkedId.toString(); // now safe
    const targetUser = global.connectedUsers?.[adminId];

    console.log(`👤 Admin ID: ${adminId}, Email: ${adminUser.username}`);

    if (targetUser) {
      io.to(targetUser.socketId).emit("SentNewDocuNotification", SendMessage);
      console.log(`📨 Sent document notification to online admin (${adminId})`);
    } else {
      console.log(`📭 Admin (${adminId}) is offline. Notification saved.`);
    }
  });

  res.status(201).json({
    status: "success",
    message: "New file version added. Old file archived.",
    data: finalFile,
  });
});

exports.getOfficer = AsyncErrorHandler(async (req, res) => {
  console.log("getOfficer controller")
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
