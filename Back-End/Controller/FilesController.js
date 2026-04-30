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
const axios = require("axios");
const { pipeline } = require("stream");
const util = require("util");
const ftp = require("basic-ftp");
const fs = require("fs");
const FormData = require("form-data");
const zlib = require("zlib");
const os = require("os");
const ftpClient = new ftp.Client();
ftpClient.ftp.verbose = true;

const tempDir = os.tmpdir();
const pump = util.promisify(pipeline);

function cleanupTempFiles() {
  const now = Date.now();
  const expiry = 24 * 60 * 60 * 1000;
  let deletedCount = 0;

  fs.readdir(tempDir, (err, files) => {
    if (err) return;

    files.forEach((file) => {
      if (file.endsWith(".pdf")) {
        const filePath = path.join(tempDir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) return;
          if (now - stats.mtimeMs > expiry) {
            fs.unlink(filePath, (err) => {
              if (!err) {
                deletedCount++;
                console.log(`[CLEANUP] Deleted old temp file: ${filePath}`);
              }
            });
          }
        });
      }
    });

    if (deletedCount > 0) {
      console.log(`[CLEANUP] ${deletedCount} old temp files deleted.`);
    } else {
      console.log(`[CLEANUP] No expired temp files found.`);
    }
  });
}

setInterval(cleanupTempFiles, 60 * 60 * 1000);

exports.updateFiles = AsyncErrorHandler(async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    console.log("Update payload:", updateData);

    // Convert category object to ID
    if (updateData.category && typeof updateData.category === "object") {
      updateData.category = updateData.category._id;
    }

    // Remove empty or null fields (so they won't overwrite)
    Object.keys(updateData).forEach(key => {
      if (
        updateData[key] === null ||
        updateData[key] === undefined ||
        (typeof updateData[key] === "string" && updateData[key].trim() === "")
      ) {
        delete updateData[key];
      }
    });

    // FORCE REPLACE ALL PERSONNEL ARRAYS
    const arrayFields = ['chairpersons', 'viceChairpersons', 'members'];

    arrayFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (!Array.isArray(updateData[field])) {
          updateData[field] = [updateData[field]];
        }
        updateData[field] = updateData[field].filter(
          id => id && /^[0-9a-fA-F]{24}$/.test(id.toString())
        );
        console.log(`${field} will be set to:`, updateData[field]);
      }
    });

    // Handle archive/delete status
    const newStatus = req.body.ArchivedStatus;
    const admin = req.user.linkId;

    if (newStatus === "Deleted") {
      updateData.archivedMetadata = {
        dateArchived: new Date(),
        archivedBy: admin,
        notes: "Archived due to delete",
      };
      updateData.ArchivedStatus = "Deleted";
    } else if (newStatus === "For Restore") {
      updateData.ArchivedStatus = "Active";
      delete updateData.archivedMetadata;
    }

    // Find and update
    const oldFile = await Files.findById(req.params.id);
    if (!oldFile) {
      return res.status(404).json({ status: "fail", message: "File not found" });
    }

    const updatedFile = await Files.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Logging
    const allowedRoles = ["admin", "officer"];
    const role = req.user?.role?.toLowerCase();

    if (allowedRoles.includes(role)) {
      const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
      let logType = "UPDATE";
      let logAction = "Updated a DocumentFile";
      let logLevel = "info";

      if (newStatus === "Deleted") {
        logType = "DELETE";
        logAction = "Deleted a DocumentFile";
        logLevel = "warning";
      } else if (newStatus === "For Restore") {
        logType = "RESTORE";
        logAction = "Restored a DocumentFile";
      }

      await ActivityLog.create({
        type: logType,
        action: logAction,
        performedBy: req.user.linkId,
        performedByModel: capitalizedRole,
        file: updatedFile._id,
        beforeChange: oldFile,
        afterChange: updatedFile,
        message: `${capitalizedRole} updated file '${updatedFile.title}'`,
        level: logLevel,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        timestamp: new Date()
      });
    }

    res.status(200).json({
      status: "success",
      data: updatedFile,
      message: `File updated successfully - All personnel arrays replaced`
    });
  } catch (err) {
    console.error("Update Error:", err);

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        status: "error",
        message: "Validation Error",
        errors: Object.values(err.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      status: "error",
      message: "Internal server error",
      details: err.message
    });
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
          folderID: 1,
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
              SendMessage,
            );
            console.log(
              `📨 Sent socket notification to ONLINE admin (${adminId})`,
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
    const io = req.app.get("io");
    //io.emit("DeleteDocument", updatedFile);

    res.status(200).json({ status: "success", data: updatedFile });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

const sanitizeFilename = (name) => {
  const ext = path.extname(name); // .pdf, .docx, etc
  const baseName = path.basename(name, ext); // remove extension temporarily
  const safeBase = baseName.replace(/[#.\/\\?%*:|"<>]/g, ""); // tanggalin lahat ng # at .
  return safeBase + ext;
};

exports.createFiles = AsyncErrorHandler(async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const {
      title,
      category,
      summary,
      author,
      admin,
      chairpersons,
      members,
      isFeatured,
      viceChairpersons,
      resolutionNumber,
      dateOfResolution,
      approverID,
      oldFile,
      folderID,
      status = "Approved",
    } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Please Enter Title!" });
    }

    if (!admin) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!category) {
      return res.status(400).json({ error: "Please Select Category" });
    }

    if (!mongoose.Types.ObjectId.isValid(admin))
      return res.status(400).json({ error: "Invalid admin ID" });
    if (approverID && !mongoose.Types.ObjectId.isValid(approverID))
      return res.status(400).json({ error: "Invalid approver ID" });

    // Parse at convert array fields mula sa JSON string to ObjectIds
    let parsedChairpersons = [];
    let parsedViceChairpersons = [];
    let parsedMembers = [];
    let parsedAuthor = null;

    if (chairpersons) {
      try {
        let tempArray = [];
        if (typeof chairpersons === 'string' && chairpersons.startsWith('[')) {
          tempArray = JSON.parse(chairpersons);
        } else if (Array.isArray(chairpersons)) {
          tempArray = chairpersons;
        }

        // Convert each string ID to ObjectId string (not ObjectId instance)
        parsedChairpersons = tempArray.map(id => {
          if (mongoose.Types.ObjectId.isValid(id)) {
            return id; // Keep as string, Mongoose will auto-convert
          }
          return null;
        }).filter(id => id !== null);

        console.log("Parsed chairpersons:", parsedChairpersons);
      } catch (err) {
        console.error("Error parsing chairpersons:", err);
        return res.status(400).json({ error: "Invalid chairpersons format" });
      }
    }

    if (viceChairpersons) {
      try {
        let tempArray = [];
        if (typeof viceChairpersons === 'string' && viceChairpersons.startsWith('[')) {
          tempArray = JSON.parse(viceChairpersons);
        } else if (Array.isArray(viceChairpersons)) {
          tempArray = viceChairpersons;
        }

        // Convert each string ID to ObjectId string (not ObjectId instance)
        parsedViceChairpersons = tempArray.map(id => {
          if (mongoose.Types.ObjectId.isValid(id)) {
            return id; // Keep as string, Mongoose will auto-convert
          }
          return null;
        }).filter(id => id !== null);

        console.log("Parsed viceChairpersons:", parsedViceChairpersons);
      } catch (err) {
        console.error("Error parsing viceChairpersons:", err);
        return res.status(400).json({ error: "Invalid viceChairpersons format" });
      }
    }

    if (members) {
      try {
        let tempArray = [];
        if (typeof members === 'string' && members.startsWith('[')) {
          tempArray = JSON.parse(members);
        } else if (Array.isArray(members)) {
          tempArray = members;
        }

        // Convert each string ID to ObjectId string (not ObjectId instance)
        parsedMembers = tempArray.map(id => {
          if (mongoose.Types.ObjectId.isValid(id)) {
            return id; // Keep as string, Mongoose will auto-convert
          }
          return null;
        }).filter(id => id !== null);

        console.log("Parsed members:", parsedMembers);
      } catch (err) {
        console.error("Error parsing members:", err);
        return res.status(400).json({ error: "Invalid members format" });
      }
    }

    // Parse author field similarly
    if (author) {
      try {
        if (typeof author === 'string' && author.startsWith('[')) {
          // If it's a JSON array string with multiple authors
          const tempArray = JSON.parse(author);
          if (Array.isArray(tempArray) && tempArray.length > 0) {
            // For multiple authors, take the first valid one or handle as array
            parsedAuthor = tempArray.map(id => {
              if (mongoose.Types.ObjectId.isValid(id)) {
                return id;
              }
              return null;
            }).filter(id => id !== null);

            // If we want author as single ID, take the first valid
            if (parsedAuthor.length > 0) {
              parsedAuthor = parsedAuthor[0];
            } else {
              parsedAuthor = null;
            }
          } else {
            parsedAuthor = mongoose.Types.ObjectId.isValid(tempArray) ? tempArray : null;
          }
        } else if (Array.isArray(author)) {
          // If author is already an array
          const validAuthors = author.filter(id => mongoose.Types.ObjectId.isValid(id));
          parsedAuthor = validAuthors.length > 0 ? validAuthors[0] : null;
        } else if (mongoose.Types.ObjectId.isValid(author)) {
          // If author is a single valid ID string
          parsedAuthor = author;
        } else {
          parsedAuthor = null;
        }

        console.log("Parsed author:", parsedAuthor);
      } catch (err) {
        console.error("Error parsing author:", err);
        return res.status(400).json({ error: "Invalid author format" });
      }
    }

    // Validate ObjectIds
    const isValidObjectIdArray = (arr) => {
      if (!Array.isArray(arr)) return false;
      return arr.every(id => mongoose.Types.ObjectId.isValid(id));
    };

    if (parsedChairpersons.length > 0 && !isValidObjectIdArray(parsedChairpersons)) {
      return res.status(400).json({ error: "Invalid chairperson ID(s)" });
    }

    if (parsedViceChairpersons.length > 0 && !isValidObjectIdArray(parsedViceChairpersons)) {
      return res.status(400).json({ error: "Invalid vice chairperson ID(s)" });
    }

    if (parsedMembers.length > 0 && !isValidObjectIdArray(parsedMembers)) {
      return res.status(400).json({ error: "Invalid member ID(s)" });
    }

    // Validate author if it exists and is an array (though we converted to single ID)
    if (parsedAuthor && !mongoose.Types.ObjectId.isValid(parsedAuthor)) {
      return res.status(400).json({ error: "Invalid author ID" });
    }

    // --- Sanitize server filename ---
    const originalName = req.file.originalname; // original name for display
    const safeServerFileName = sanitizeFilename(req.file.filename); // safe name for server storage
    const ext = path.extname(originalName).toLowerCase();
    const fileSize = req.file.size;

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
    const originalPath = req.file.path;

    // --- Stream gzip directly to Hostinger ---
    const gzip = zlib.createGzip();
    const readStream = fs.createReadStream(originalPath);

    const form = new FormData();
    form.append("file", readStream.pipe(gzip), safeServerFileName + ".gz"); // server-safe filename

    let remotePath;
    try {
      const response = await axios.post(process.env.UPLOAD_URL, form, {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
      });

      if (!response.data.success) {
        return res
          .status(500)
          .json({ error: response.data.message || "Upload failed" });
      }

      remotePath = response.data.url;
      fs.unlink(originalPath, () => { });
    } catch (err) {
      console.error("Hostinger upload failed:", err.message);
      return res
        .status(500)
        .json({ error: "Failed to upload file to Hostinger" });
    }

    // --- Prepare DB entry ---
    const fileData = {
      title,
      resolutionNumber: resolutionNumber || null,
      category,
      summary: summary || "",
      author: parsedAuthor || null,  // Use parsed author
      fileSize,
      admin, isFeatured,
      approverID: approverID || null,
      status,
      dateOfResolution: dateOfResolution || null,
      fileName: safeServerFileName + ".gz", // safe name in server
      originalFileName: originalName, // preserve original name for display
      fileUrl: remotePath,
      oldFile: oldFile === 'true' || oldFile === true,
      folderID,
      folderPath: process.env.UPLOAD_FOLDER,
      fullText: fullTextType,
      // Dagdag na fields - ilagay bilang strings, Mongoose ang bahala mag-convert
      chairpersons: parsedChairpersons,
      viceChairpersons: parsedViceChairpersons,
      members: parsedMembers,
    };

    let categoryName = null;
    if (mongoose.Types.ObjectId.isValid(category)) {
      const categoryDoc = await Category.findById(category).lean();
      categoryName = categoryDoc?.category;
    }

    if (fileData.oldFile) {
      fileData.ArchivedStatus =
        categoryName === "Resolution" || categoryName === "Ordinance"
          ? "Active"
          : "Archived";
      fileData.status =
        categoryName === "Resolution" || categoryName === "Ordinance"
          ? "Approved"
          : fileData.status;
    } else {
      fileData.ArchivedStatus =
        categoryName === "Resolution" || categoryName === "Ordinance"
          ? "Active"
          : "Archived";
    }

    console.log("File data to save:", {
      title: fileData.title,
      author: fileData.author,
      chairpersons: fileData.chairpersons,
      viceChairpersons: fileData.viceChairpersons,
      members: fileData.members
    });

    const savedFile = await new Files(fileData).save();

    // --- Activity log ---
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
    const io = req.app.get("io");
    //io.emit("AddOldFile", savedFile);
    res.status(201).json({
      status: "success",
      data: savedFile,
      message: "File created successfully with committee members"
    });
  } catch (err) {
    console.error("Upload error details:", {
      message: err.message,
      name: err.name,
      errors: err.errors,
      stack: err.stack
    });
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
      fieldErrors: err.errors
    });
  }
});

exports.DisplayFiles = AsyncErrorHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limitNumber = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limitNumber;

  const { title, tags, status, category, dateFrom, dateTo } = req.query;

  const matchStage = {
    ArchivedStatus: { $nin: ["For Restore", "Deleted"] },
  };

  if (title) {
    matchStage.title = { $regex: title, $options: "i" };
  }

  if (tags) {
    let tagArray = [];
    if (Array.isArray(tags))
      tagArray = tags.map((tag) => tag.trim().toLowerCase());
    else if (typeof tags === "string")
      tagArray = tags.split(",").map((tag) => tag.trim().toLowerCase());

    if (tagArray.length > 0) matchStage.tags = { $in: tagArray };
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

  // Get all active tags excluding "For Restore" and "Deleted"
  const activeTagDocs = await Files.aggregate([
    { $match: { ArchivedStatus: { $nin: ["For Restore", "Deleted"] } } },
    { $project: { tags: 1 } },
  ]);

  const allActiveTagsSet = new Set();
  activeTagDocs.forEach((doc) => {
    if (Array.isArray(doc.tags))
      doc.tags.forEach((tag) => allActiveTagsSet.add(tag));
  });
  const allActiveTags = Array.from(allActiveTagsSet);

  // Main aggregation for files
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
          { $limit: limitNumber },
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
              viceChairpersons: 1,
              members: 1,
              chairpersons: 1,
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
  const totalPages = Math.ceil(totalCount / limitNumber);

  // Today documents count (exclude For Restore & Deleted)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const totalDocumentsToday = await Files.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
    ArchivedStatus: { $nin: ["For Restore", "Deleted"] },
  });

  // Latest approved bills of the week
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const latestBill = await Files.find({
    ArchivedStatus: { $nin: ["For Restore", "Deleted"] },
    status: "Approved",
    dateOfResolution: { $gte: startOfWeek, $lte: endOfWeek },
  })
    .sort({ dateOfResolution: -1 })
    .limit(3)
    .select("title dateOfResolution status fileUrl fileName");

  // Monthly total file size summary (January–December)
  const monthlySummaryRaw = await Files.aggregate([
    {
      $match: {
        ArchivedStatus: { $nin: ["Deleted", "For Restore"] },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalFileSize: { $sum: "$fileSize" },
      },
    },
  ]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthlyFileSummary = months.map((month, index) => {
    const found = monthlySummaryRaw.find((m) => m._id === index + 1);
    return {
      month,
      totalFileSize: found ? found.totalFileSize * 5 : 0, // multiply by 15
    };
  });

  // Final response
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
    monthlyFileSummary,
  });
});

exports.getLatestBillsThisWeek = async (req, res) => {
  try {
    const latestBill = await Files.aggregate([
      {
        $match: {
          status: "Approved",
          isFeatured: true,
          ArchivedStatus: { $nin: ["Deleted", "For Restore"] },
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

      { $sort: { dateOfResolution: -1 } },
      { $limit: 5 },

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

  // --- MATCH filters for regular members (hindi ex-official) ---
  const matchStage = { isExOfficial: { $ne: true } };
  if (district) matchStage.district = district;
  if (detailInfo) matchStage.detailInfo = detailInfo;

  if (Object.keys(matchStage).length > 0) {
    aggregationPipeline.push({ $match: matchStage });
  }

  // --- LOOKUPS ---
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
            {
              $cond: [
                {
                  $and: [
                    { $ne: ["$middle_name", null] },
                    { $ne: ["$middle_name", ""] }
                  ]
                },
                {
                  $concat: [
                    { $substrCP: ["$middle_name", 0, 1] },
                    ". ",
                    "$last_name"
                  ]
                },
                "$last_name"
              ]
            }
          ]
        },
        memberInfo: "$$ROOT",
        priorityNumber: { $ifNull: ["$priorityNumber", 999] },
        memberType: { $literal: "regular" }
      },
    }
  );

  // --- SEARCH for regular members ---
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

  // --- TERM filter for regular members ---
  if (term_from && term_to) {
    const from = new Date(term_from);
    const to = new Date(term_to);

    aggregationPipeline.push({
      $match: {
        term_from: { $gte: from },
        term_to: { $lte: to },
      },
    });
  }

  // --- SORT by priorityNumber ---
  aggregationPipeline.push({ $sort: { priorityNumber: 1 } });

  // --- GROUP per term for regular members ---
  aggregationPipeline.push({
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
          priorityNumber: "$priorityNumber",
          memberInfo: "$memberInfo",
          memberType: "$memberType",
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
  });

  // --- UNWIND para ma-index ---
  aggregationPipeline.push({
    $unwind: { path: "$members", includeArrayIndex: "index" },
  });

  // --- STEP 4: KEEP existing priorityNumber OR fallback sa index+1 ---
  aggregationPipeline.push({
    $addFields: {
      "members.priorityNumber": {
        $ifNull: ["$members.priorityNumber", { $add: ["$index", 1] }],
      },
    },
  });

  // --- RE-GROUP per term ---
  aggregationPipeline.push({
    $group: {
      _id: {
        term_from: "$_id.term_from",
        term_to: "$_id.term_to",
      },
      members: { $push: "$members" },
    },
  });

  // --- FINAL FORMAT for regular members ---
  aggregationPipeline.push(
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

  // --- EXECUTE for regular members ---
  let AuthorsWithFiles = await SBmember.aggregate(aggregationPipeline).allowDiskUse(true);

  // ==================== GET EX-OFFICIAL MEMBERS ====================
  
  // Query para sa ex-official members
  const exOfficialMatchStage = { isExOfficial: true };
  
  if (district) exOfficialMatchStage.district = district;
  if (detailInfo) exOfficialMatchStage.detailInfo = detailInfo;
  
  if (search) {
    const s = search.trim();
    exOfficialMatchStage.$or = [
      { first_name: { $regex: s, $options: "i" } },
      { middle_name: { $regex: s, $options: "i" } },
      { last_name: { $regex: s, $options: "i" } }
    ];
  }
  
  // Term filter para sa ex-official members
  if (term_from && term_to) {
    const fromYear = new Date(term_from).getFullYear();
    const toYear = new Date(term_to).getFullYear();
    
    exOfficialMatchStage.$or = [
      // Kung may year_from/year_to, gamitin yun
      {
        $and: [
          { year_from: { $exists: true, $ne: null } },
          { year_to: { $exists: true, $ne: null } },
          { year_from: fromYear },
          { year_to: toYear }
        ]
      },
      // Kung walang year_from/year_to, gamitin ang term_from/term_to
      {
        $and: [
          { $or: [{ year_from: { $exists: false } }, { year_from: null }] },
          {
            term_from: { $gte: new Date(term_from) },
            term_to: { $lte: new Date(term_to) }
          }
        ]
      }
    ];
  }
  
  const exOfficialMembers = await SBmember.find(exOfficialMatchStage)
    .sort({ priorityNumber: 1 })
    .lean();
  
  // I-format ang ex-official members
  const formattedExOfficials = exOfficialMembers.map(exMember => {
    const hasYearData = exMember.year_from && exMember.year_to;
    
    // Para sa grouping, kung may year_from/year_to, gamitin yun. Kung wala, gamitin ang term_from/term_to
    let groupFrom, groupTo;
    if (hasYearData) {
      groupFrom = new Date(exMember.year_from, 0, 1);
      groupTo = new Date(exMember.year_to, 11, 31);
    } else if (exMember.term_from && exMember.term_to) {
      groupFrom = exMember.term_from;
      groupTo = exMember.term_to;
    } else {
      const currentYear = new Date().getFullYear();
      groupFrom = new Date(currentYear, 0, 1);
      groupTo = new Date(currentYear, 11, 31);
    }
    
    return {
      ...exMember,
      memberType: "ex-official",
      isExOfficial: true,
      groupTermFrom: groupFrom,
      groupTermTo: groupTo,
      displayTerm: hasYearData 
        ? `${exMember.year_from} - ${exMember.year_to}`
        : `${new Date(groupFrom).getFullYear()} - ${new Date(groupTo).getFullYear()}`,
      fullName: exMember.fullName || `${exMember.first_name} ${exMember.middle_name ? exMember.middle_name.charAt(0) + '. ' : ''}${exMember.last_name}`,
      files: [] // Ex-official members walang files initially
    };
  });
  
  // I-merge ang ex-official members sa existing term groups
  if (formattedExOfficials.length > 0) {
    console.log("🔄 Merging ex-official members into term groups...");
    
    // I-process ang bawat term group at i-merge ang ex-official members
    AuthorsWithFiles = AuthorsWithFiles.map(termGroup => {
      const termFromYear = termGroup.term_from ? new Date(termGroup.term_from).getFullYear() : null;
      const termToYear = termGroup.term_to ? new Date(termGroup.term_to).getFullYear() : null;
      
      if (!termFromYear || !termToYear) return termGroup;
      
      const matchingExOfficials = formattedExOfficials.filter(exMember => {
        const exFromYear = new Date(exMember.groupTermFrom).getFullYear();
        const exToYear = new Date(exMember.groupTermTo).getFullYear();
        return exFromYear === termFromYear && exToYear === termToYear;
      });
      
      const allMembers = [...termGroup.members, ...matchingExOfficials];
      
      const sortedMembers = allMembers.sort((a, b) => {
        const priorityA = Number(a.priorityNumber) || 9999;
        const priorityB = Number(b.priorityNumber) || 9999;
        return priorityA - priorityB;
      });
      
      return {
        ...termGroup,
        members: sortedMembers,
        totalCount: sortedMembers.length,
        regularCount: termGroup.members.length,
        exOfficialCount: matchingExOfficials.length
      };
    });
    
    // Gumawa ng bagong term groups para sa unmatched ex-official members
    const matchedExOfficialIds = new Set();
    AuthorsWithFiles.forEach(termGroup => {
      termGroup.members.forEach(member => {
        if (member.memberType === "ex-official" && member._id) {
          matchedExOfficialIds.add(member._id.toString());
        }
      });
    });
    
    const unmatchedExOfficials = formattedExOfficials.filter(
      exMember => !matchedExOfficialIds.has(exMember._id.toString())
    );
    
    if (unmatchedExOfficials.length > 0) {
      console.log("Creating new term groups for unmatched ex-official members:", unmatchedExOfficials.length);
      
      const newTermGroups = unmatchedExOfficials.map(exMember => {
        const hasYearData = exMember.year_from && exMember.year_to;
        
        return {
          term_from: exMember.groupTermFrom,
          term_to: exMember.groupTermTo,
          members: [{ ...exMember, memberInfo: exMember }],
          totalCount: 1,
          isFromExOfficial: true,
          hasYearData: hasYearData
        };
      });
      
      AuthorsWithFiles = [...AuthorsWithFiles, ...newTermGroups];
      
      AuthorsWithFiles.sort((a, b) => {
        const yearA = a.term_to ? new Date(a.term_to).getFullYear() : 0;
        const yearB = b.term_to ? new Date(b.term_to).getFullYear() : 0;
        return yearB - yearA;
      });
    }
  }
  
  // I-remove ang term_from/term_to para sa ex-official groups na may year data
  AuthorsWithFiles = AuthorsWithFiles.map(group => {
    if (group.isFromExOfficial && group.hasYearData) {
      const { term_from, term_to, ...restOfGroup } = group;
      return { ...restOfGroup, term_from: null, term_to: null };
    }
    return group;
  });

  // --- PINAGBAGO: I-return ang lahat ng members ng walang pagination ---
  const allTermsWithFullMembers = AuthorsWithFiles.map((term) => {
    const membersWithCounts = (term.members || []).map((member) => {
      const files = member.files || [];
      return {
        ...member,
        count: files.length,
        resolutionCount: files.filter((f) => f.category === "Resolution").length,
        ordinanceCount: files.filter((f) => f.category === "Ordinance").length,
      };
    });

    return {
      term_from: term.term_from,
      term_to: term.term_to,
      year_from: term.year_from,
      year_to: term.year_to,
      totalCount: membersWithCounts.length,
      members: membersWithCounts, // Lahat ng members, hindi na sliced
    };
  });

  res.status(200).json({
    status: "success",
    data: allTermsWithFullMembers,
  });
});

exports.getFileCloud = AsyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const file = await Files.findById(id);
  if (!file) return res.status(404).json({ message: "File not found." });

  if (!file.fileUrl)
    return res.status(500).json({ message: "File URL missing in DB" });

  const fileExt = path.extname(file.fileUrl).toLowerCase();
  const tempFilePath = path.join(tempDir, file._id + ".pdf");

  try {
    if (!fs.existsSync(tempFilePath)) {
      console.log(`[CACHE MISS] Downloading file ${file.fileUrl}...`);
      const response = await axios.get(file.fileUrl, {
        responseType: "stream",
      });

      if (fileExt === ".gz") {
        console.log(`[DECOMPRESS] Extracting GZIP file...`);
        const gunzip = zlib.createGunzip();
        const writeStream = fs.createWriteStream(tempFilePath);
        await pump(response.data, gunzip, writeStream);
      } else {
        const writeStream = fs.createWriteStream(tempFilePath);
        await pump(response.data, writeStream);
      }

      console.log(`[CACHE WRITE] Saved to temp: ${tempFilePath}`);
    } else {
      console.log(`[CACHE HIT] Serving from temp: ${tempFilePath}`);
    }
    res.setHeader("Accept-Ranges", "bytes");

    const stat = fs.statSync(tempFilePath);
    const range = req.headers.range;

    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "application/pdf",
      });

      const fileStream = fs.createReadStream(tempFilePath, { start, end });
      await pump(fileStream, res);
    } else {
      res.writeHead(200, {
        "Content-Length": stat.size,
        "Content-Type": "application/pdf",
      });

      const fileStream = fs.createReadStream(tempFilePath);
      await pump(fileStream, res);
    }
  } catch (err) {
    console.error("Streaming failed:", err);
    if (!res.headersSent)
      res
        .status(500)
        .json({ message: "File streaming failed", error: err.message });
  }
});

exports.getFileForPubliCloud = AsyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const file = await Files.findById(id);
  if (!file) return res.status(404).json({ message: "File not found." });

  if (!file.fileUrl)
    return res.status(500).json({ message: "File URL missing in DB" });

  const fileExt = path.extname(file.fileUrl).toLowerCase();
  const tempFilePath = path.join(tempDir, file._id + ".pdf");

  try {
    if (!fs.existsSync(tempFilePath)) {
      console.log(`[CACHE MISS] Downloading file ${file.fileUrl}...`);
      const response = await axios.get(file.fileUrl, {
        responseType: "stream",
      });

      if (fileExt === ".gz") {
        console.log(`[DECOMPRESS] Extracting GZIP file...`);
        const gunzip = zlib.createGunzip();
        const writeStream = fs.createWriteStream(tempFilePath);
        await pump(response.data, gunzip, writeStream);
      } else {
        const writeStream = fs.createWriteStream(tempFilePath);
        await pump(response.data, writeStream);
      }

      console.log(`[CACHE WRITE] Saved to temp: ${tempFilePath}`);
    } else {
      console.log(`[CACHE HIT] Serving from temp: ${tempFilePath}`);
    }
    res.setHeader("Accept-Ranges", "bytes");

    const stat = fs.statSync(tempFilePath);
    const range = req.headers.range;

    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "application/pdf",
      });

      const fileStream = fs.createReadStream(tempFilePath, { start, end });
      await pump(fileStream, res);
    } else {
      res.writeHead(200, {
        "Content-Length": stat.size,
        "Content-Type": "application/pdf",
      });

      const fileStream = fs.createReadStream(tempFilePath);
      await pump(fileStream, res);
    }
  } catch (err) {
    console.error("Streaming failed:", err);
    if (!res.headersSent)
      res
        .status(500)
        .json({ message: "File streaming failed", error: err.message });
  }
});

exports.RemoveFiles = AsyncErrorHandler(async (req, res) => {
  try {
    const file = await Files.findById(req.params.id);
    if (!file) {
      return res
        .status(404)
        .json({ status: "fail", message: "File not found" });
    }

    if (file.fileUrl) {
      try {
        const response = await axios.post(process.env.VITE_REMOVE_URL, {
          file: file.fileUrl,
        });

        if (!response.data.success) {
          console.error("Hostinger deletion failed:", response.data.message);
          return res.status(500).json({
            status: "fail",
            message:
              "Failed to delete file from Hostinger. Database not updated.",
          });
        }
        console.log("File deleted from Hostinger:", file.fileUrl);
      } catch (err) {
        console.error("Hostinger delete failed:", err.message || err);
        return res.status(500).json({
          status: "fail",
          message:
            "Failed to delete file from Hostinger. Database not updated.",
        });
      }
    }

    // Kung successful ang pag-delete sa Hostinger, magpatuloy sa database operations
    const allowedRoles = ["admin", "officer"];
    const role = req.user?.role?.toLowerCase();
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
    { new: true },
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
      `📨 Sent document notification to online officer (${officerId})`,
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
    new Set(activeTagDocs.flatMap((doc) => doc.tags || [])),
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
  if (!existingFile) return res.status(404).json({ error: "File not found" });

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

  // Kapag Approved, kunin lahat ng Active at Archived
  if (status === "Approved") {
    matchStage.status = "Approved";
    matchStage.$or = [
      { ArchivedStatus: "Active" },
      { ArchivedStatus: "Archived" },
    ];
  } else {
    if (ArchivedStatus) matchStage.ArchivedStatus = ArchivedStatus;
    if (status) matchStage.status = status;
  }

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

  // --- Main aggregation ---
  let files = await Files.aggregate([
    { $match: matchStage },

    // --- LOOKUPS ---
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

    // --- UNWIND ---
    { $unwind: { path: "$authorInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$adminInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$officerInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$archiverInfo", preserveNullAndEmptyArrays: true } },

    // Filter: Only Resolution & Ordinance
    {
      $match: {
        "categoryInfo.category": { $in: ["Resolution", "Ordinance"] },
      },
    },

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
          `${f.authorInfo?.first_name || ""} ${f.authorInfo?.last_name || ""}`,
        ),
    );
  }

  // --- Paginate files per category ---
  const filesByCategory = {};
  files.forEach((file) => {
    const catId = file.categoryInfo?._id?.toString() || "uncategorized";
    if (!filesByCategory[catId]) filesByCategory[catId] = [];
    filesByCategory[catId].push(file);
  });

  // --- Active tags per category ---
  const activeTagsPerCategory = {};
  for (const [catId, catFiles] of Object.entries(filesByCategory)) {
    activeTagsPerCategory[catId] = Array.from(
      new Set(catFiles.flatMap((f) => f.tags || [])),
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
        author: `${f.authorInfo?.first_name || ""} ${f.authorInfo?.middle_name || ""
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
      activeTags: activeTagsPerCategory[catId],
    };
  });

  // --- Counts per type ---
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
          {
            $lookup: {
              from: "categories",
              localField: "category",
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
            $match: {
              ArchivedStatus: { $in: ["Archived", "Active"] },
              "categoryInfo.category": { $nin: ["Resolution", "Ordinance"] },
            },
          },
          { $count: "count" },
        ],

        public: [
          {
            $match: {
              status: "Approved",
              $or: [
                { ArchivedStatus: "Archived" },
                { ArchivedStatus: "Active" },
              ],
            },
          },
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

  const hasQuery = !!(
    year ||
    title ||
    tags ||
    category ||
    oldFile !== undefined
  );
  if (!hasQuery) {
    return res.status(200).json([]);
  }

  const matchStage = {
    status: "Approved",
    ArchivedStatus: { $nin: ["Deleted", "For Restore"] },
  };

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
      $ne: null,
      $exists: true,
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
      author: `${f.authorInfo?.first_name || ""} ${f.authorInfo?.middle_name || ""
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
    {
      $match: {
        ...matchStage,
        dateOfResolution: { $ne: null, $exists: true },
      },
    },
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
        $ne: null,
        $exists: true,
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
      author: `${f.authorInfo?.first_name || ""} ${f.authorInfo?.middle_name || ""
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
      totalCount: totalDocuments,
      currentPage: page,
      results: formattedFiles.length,
      data: formattedFiles,
    });
  }

  res.status(200).json(results);
});


// --- Helper function for lookups/unwinds ---
function lookupAndUnwindStages() {
  return [
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
  ];
}

exports.PublicGetAuthorwithFiles = AsyncErrorHandler(async (req, res, next) => {
  const {
    search,
    district,
    detailInfo,
    Position,
    term,
    page,
    limit
  } = req.query;

  const limitNumber = parseInt(limit) || 20;
  const currentPage = parseInt(page) || 1;
  const skip = (currentPage - 1) * limitNumber;

  const matchStage = {};

  if (district) matchStage.district = district;
  if (detailInfo) matchStage.detailInfo = detailInfo;

  if (Position) {
    matchStage.Position = { $regex: `^${Position}$`, $options: "i" };
  }

  if (search) {
    const s = search.trim();
    matchStage.$or = [
      { first_name: { $regex: `^${s}`, $options: "i" } },
      { middle_name: { $regex: `^${s}`, $options: "i" } },
      { last_name: { $regex: `^${s}`, $options: "i" } }
    ];
  }

  // ✅ TERM FILTER (by YEAR only) - para sa regular members at ex-official na walang year_from/year_to
  if (term) {
    const [fromYear, toYear] = term.split("-");

    matchStage.$expr = {
      $and: [
        { $eq: [{ $year: "$term_from" }, parseInt(fromYear)] },
        { $eq: [{ $year: "$term_to" }, parseInt(toYear)] }
      ]
    };
  }

  const pipeline = [];

  // ✅ Apply match for regular members (hindi ex-official)
  const regularMatchStage = {
    ...matchStage,
    isExOfficial: { $ne: true }
  };
  
  if (Object.keys(regularMatchStage).length > 0) {
    pipeline.push({ $match: regularMatchStage });
  }

  // ✅ Lookup files for regular members
  pipeline.push({
    $lookup: {
      from: "files",
      let: { memberId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$memberId", "$$memberId"] },
                { $eq: ["$status", "Approved"] },
                { $in: ["$ArchivedStatus", ["Archived", "Active"]] }
              ]
            }
          }
        }
      ],
      as: "files"
    }
  });

  // ✅ Full Name for regular members
  pipeline.push({
    $addFields: {
      fullName: {
        $concat: [
          "$first_name",
          " ",
          {
            $cond: [
              {
                $and: [
                  { $ne: ["$middle_name", null] },
                  { $ne: ["$middle_name", ""] }
                ]
              },
              {
                $concat: [
                  { $substrCP: ["$middle_name", 0, 1] },
                  ". ",
                  "$last_name"
                ]
              },
              "$last_name"
            ]
          }
        ]
      },
      memberType: { $literal: "regular" }
    }
  });

  // ✅ SORT REGULAR MEMBERS BY priorityNumber
  pipeline.push({
    $sort: { "priorityNumber": 1 }
  });

  // ✅ GET EX-OFFICIAL MEMBERS (isExOfficial = true)
  // Kasama lahat ng ex-official members (may year_from/year_to man o wala)
  const exOfficialMatchStage = { 
    isExOfficial: true
  };
  
  // Apply search filters for ex-official
  if (search) {
    const s = search.trim();
    exOfficialMatchStage.$or = [
      { first_name: { $regex: `^${s}`, $options: "i" } },
      { middle_name: { $regex: `^${s}`, $options: "i" } },
      { last_name: { $regex: `^${s}`, $options: "i" } }
    ];
  }
  
  if (district) exOfficialMatchStage.district = district;
  if (detailInfo) exOfficialMatchStage.detailInfo = detailInfo;
  if (Position) {
    exOfficialMatchStage.Position = { $regex: `^${Position}$`, $options: "i" };
  }

  // Apply term filter sa ex-official members kung wala silang year_from/year_to
  if (term && !exOfficialMatchStage.$expr) {
    const [fromYear, toYear] = term.split("-");
    exOfficialMatchStage.$or = [
      // Kung may year_from/year_to, gamitin yun
      {
        $and: [
          { year_from: { $exists: true, $ne: null } },
          { year_to: { $exists: true, $ne: null } },
          { year_from: parseInt(fromYear) },
          { year_to: parseInt(toYear) }
        ]
      },
      // Kung walang year_from/year_to, gamitin ang term_from/term_to
      {
        $and: [
          { $or: [{ year_from: { $exists: false } }, { year_from: null }] },
          { $expr: {
              $and: [
                { $eq: [{ $year: "$term_from" }, parseInt(fromYear)] },
                { $eq: [{ $year: "$term_to" }, parseInt(toYear)] }
              ]
            }
          }
        ]
      }
    ];
  }

  const exOfficialMembers = await SBmember.find(exOfficialMatchStage)
    .sort({ priorityNumber: 1 })
    .lean();

  console.log("Ex-Official Members found:", exOfficialMembers.length);
  console.log("With year_from/year_to:", exOfficialMembers.filter(m => m.year_from && m.year_to).length);
  console.log("Without year_from/year_to:", exOfficialMembers.filter(m => !m.year_from || !m.year_to).length);

  // ✅ GROUP BY YEAR ONLY (from regular members using term_from/term_to)
  pipeline.push({
    $group: {
      _id: {
        fromYear: { $year: "$term_from" },
        toYear: { $year: "$term_to" }
      },
      members: { $push: "$$ROOT" }
    }
  });

  // ✅ FORMAT + PAGINATION for regular members
  pipeline.push({
    $project: {
      term: {
        $concat: [
          { $toString: "$_id.fromYear" },
          "-",
          { $toString: "$_id.toYear" }
        ]
      },
      term_from: {
        $dateFromParts: {
          year: "$_id.fromYear",
          month: 1,
          day: 1
        }
      },
      term_to: {
        $dateFromParts: {
          year: "$_id.toYear",
          month: 12,
          day: 31
        }
      },
      totalMembers: { $size: "$members" },
      members: {
        $slice: ["$members", skip, limitNumber]
      },
      currentPage: { $literal: currentPage },
      totalPages: {
        $ceil: {
          $divide: [{ $size: "$members" }, limitNumber]
        }
      }
    }
  });

  // ✅ Sort latest term first
  pipeline.push({
    $sort: { "_id.toYear": -1 }
  });

  let result = await SBmember.aggregate(pipeline).allowDiskUse(true);

  // ✅✅✅ MERGE EX-OFFICIAL MEMBERS
  if (exOfficialMembers.length > 0) {
    console.log("🔄 Merging ex-official members into term groups...");
    
    // I-process ang bawat term group at i-merge ang ex-official members
    result = result.map(termGroup => {
      // Extract term years from the group
      const termFromYear = termGroup.term_from ? new Date(termGroup.term_from).getFullYear() : null;
      const termToYear = termGroup.term_to ? new Date(termGroup.term_to).getFullYear() : null;
      
      if (!termFromYear || !termToYear) return termGroup;
      
      // Hanapin ang ex-official members na tugma sa term na ito
      const matchingExOfficials = exOfficialMembers.filter(exMember => {
        // Kung may year_from/year_to ang ex-official, gamitin yun
        if (exMember.year_from && exMember.year_to) {
          return exMember.year_from >= termFromYear && exMember.year_to <= termToYear;
        }
        // Kung walang year_from/year_to, gamitin ang term_from/term_to
        else if (exMember.term_from && exMember.term_to) {
          const exFromYear = new Date(exMember.term_from).getFullYear();
          const exToYear = new Date(exMember.term_to).getFullYear();
          return exFromYear === termFromYear && exToYear === termToYear;
        }
        return false;
      });
      
      // I-format ang ex-official members
      const formattedExOfficials = matchingExOfficials.map(exMember => {
        // Kung may year_from/year_to, gamitin yun. Kung wala, gamitin ang term_from/term_to
        const hasYearData = exMember.year_from && exMember.year_to;
        
        return {
          ...exMember,
          memberType: "ex-official",
          isExOfficial: true,
          // Para sa display: gamitin ang year_from/year_to kung meron, kung wala gamitin ang term_from/term_to
          displayTerm: hasYearData 
            ? `${exMember.year_from} - ${exMember.year_to}`
            : `${new Date(exMember.term_from).getFullYear()} - ${new Date(exMember.term_to).getFullYear()}`,
          fullName: exMember.fullName || `${exMember.first_name} ${exMember.middle_name ? exMember.middle_name.charAt(0) + '. ' : ''}${exMember.last_name}`
        };
      });
      
      // Pagsamahin ang regular members at ex-official members
      const allMembers = [...termGroup.members, ...formattedExOfficials];
      
      // I-sort muli ang lahat ng members by priorityNumber
      const sortedMembers = allMembers.sort((a, b) => {
        const priorityA = Number(a.priorityNumber) || 9999;
        const priorityB = Number(b.priorityNumber) || 9999;
        return priorityA - priorityB;
      });
      
      return {
        ...termGroup,
        members: sortedMembers,
        totalMembers: sortedMembers.length,
        regularCount: termGroup.members.length,
        exOfficialCount: formattedExOfficials.length,
        totalPages: Math.ceil(sortedMembers.length / limitNumber)
      };
    });
    
    // ✅ Handle Ex-Official members na walang matching term group
    const matchedExOfficialIds = new Set();
    result.forEach(termGroup => {
      termGroup.members.forEach(member => {
        if (member.memberType === "ex-official" && member._id) {
          matchedExOfficialIds.add(member._id.toString());
        }
      });
    });
    
    const unmatchedExOfficials = exOfficialMembers.filter(
      exMember => !matchedExOfficialIds.has(exMember._id.toString())
    );
    
    // Gumawa ng bagong term groups para sa unmatched ex-official members
    if (unmatchedExOfficials.length > 0) {
      console.log("Creating new term groups for unmatched ex-official members:", unmatchedExOfficials.length);
      
      const newTermGroups = unmatchedExOfficials.map(exMember => {
        // Kung may year_from/year_to, gamitin yun. Kung wala, gamitin ang term_from/term_to
        const hasYearData = exMember.year_from && exMember.year_to;
        
        let fromYear, toYear;
        if (hasYearData) {
          fromYear = exMember.year_from;
          toYear = exMember.year_to;
        } else if (exMember.term_from && exMember.term_to) {
          fromYear = new Date(exMember.term_from).getFullYear();
          toYear = new Date(exMember.term_to).getFullYear();
        } else {
          // Fallback: use current year
          const currentYear = new Date().getFullYear();
          fromYear = currentYear;
          toYear = currentYear;
        }
        
        const formattedExMember = {
          ...exMember,
          memberType: "ex-official",
          isExOfficial: true,
          displayTerm: hasYearData 
            ? `${exMember.year_from} - ${exMember.year_to}`
            : `${fromYear} - ${toYear}`,
          fullName: exMember.fullName || `${exMember.first_name} ${exMember.middle_name ? exMember.middle_name.charAt(0) + '. ' : ''}${exMember.last_name}`
        };
        
        // Gumawa ng term group
        return {
          term: `${fromYear}-${toYear}`,
          // Kung may year data, huwag isama ang term_from/term_to filters
          ...(hasYearData ? {
            year_from: fromYear,
            year_to: toYear,
            term_from: null,
            term_to: null
          } : {
            term_from: exMember.term_from,
            term_to: exMember.term_to,
            year_from: null,
            year_to: null
          }),
          members: [formattedExMember],
          totalMembers: 1,
          currentPage: 1,
          totalPages: 1,
          isFromExOfficial: true,
          hasYearData: hasYearData
        };
      });
      
      // Pagsamahin ang result at newTermGroups
      result = [...result, ...newTermGroups];
      
      // I-sort ang lahat ng term groups
      result.sort((a, b) => {
        // Para sa groups na may year_to, gamitin yun. Kung wala, gamitin ang term_to
        const yearA = a.year_to || (a.term_to ? new Date(a.term_to).getFullYear() : 0);
        const yearB = b.year_to || (b.term_to ? new Date(b.term_to).getFullYear() : 0);
        return yearB - yearA;
      });
    }
  }

  // ✅ I-remove ang term_from/term_to fields sa response para sa mga ex-official groups na may year data
  result = result.map(group => {
    if (group.isFromExOfficial && group.hasYearData) {
      // Para sa ex-official groups na may year_from/year_to, huwag isama ang term_from/term_to
      const { term_from, term_to, ...restOfGroup } = group;
      return restOfGroup;
    }
    return group;
  });

  console.log(`✅ Final result: ${result.length} term groups with ex-official members merged`);

  res.status(200).json({
    status: "success",
    data: result
  });
});

exports.PublicSummaryTerm = AsyncErrorHandler(async (req, res, next) => {
  const { first_name, middle_name, last_name } = req.query;

  // --- No query = no result ---
  if (!req.query || (!first_name && !middle_name && !last_name)) {
    return res.status(200).json({
      status: "success",
      data: [],
    });
  }

  const result = await SBmember.aggregate([
    // 1️⃣ Find member
    {
      $match: { first_name, middle_name, last_name },
    },

    // 2️⃣ Lookup files (ALL roles)
    {
      $lookup: {
        from: "files",
        let: { memberId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  {
                    $in: [
                      "$$memberId",
                      {
                        $cond: [
                          { $isArray: "$viceChairpersons" },
                          "$viceChairpersons",
                          [],
                        ],
                      },
                    ],
                  },
                  {
                    $in: [
                      "$$memberId",
                      {
                        $cond: [
                          { $isArray: "$members" },
                          "$members",
                          [],
                        ],
                      },
                    ],
                  },
                  {
                    $in: [
                      "$$memberId",
                      {
                        $cond: [
                          { $isArray: "$author" },
                          "$author",
                          [],
                        ],
                      },
                    ],
                  },
                  {
                    $in: [
                      "$$memberId",
                      {
                        $cond: [
                          { $isArray: "$chairpersons" },
                          "$chairpersons",
                          [],
                        ],
                      },
                    ],
                  },
                ],
              },
              status: "Approved",
            },
          },

          // 3️⃣ Category join
          {
            $lookup: {
              from: "categories",
              localField: "category",
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

          // 4️⃣ Filter only Ordinance / Resolution
          {
            $match: {
              "categoryInfo.category": {
                $in: ["Ordinance", "Resolution"],
              },
            },
          },
        ],
        as: "files",
      },
    },

    // 5️⃣ Add role info per file
    {
      $addFields: {
        files: {
          $map: {
            input: "$files",
            as: "f",
            in: {
              fileId: "$$f._id",
              title: "$$f.title",
              summary: "$$f.summary",
              category: "$$f.categoryInfo.category",

              roles: {
                $concatArrays: [
                  {
                    $cond: [
                      {
                        $in: [
                          "$_id",
                          {
                            $cond: [
                              { $isArray: "$$f.viceChairpersons" },
                              "$$f.viceChairpersons",
                              [],
                            ],
                          },
                        ],
                      },
                      ["ViceChairperson"],
                      [],
                    ],
                  },
                  {
                    $cond: [
                      {
                        $in: [
                          "$_id",
                          {
                            $cond: [
                              { $isArray: "$$f.members" },
                              "$$f.members",
                              [],
                            ],
                          },
                        ],
                      },
                      ["Member"],
                      [],
                    ],
                  },
                  {
                    $cond: [
                      {
                        $in: [
                          "$_id",
                          {
                            $cond: [
                              { $isArray: "$$f.author" },
                              "$$f.author",
                              [],
                            ],
                          },
                        ],
                      },
                      ["Author"],
                      [],
                    ],
                  },
                  {
                    $cond: [
                      {
                        $in: [
                          "$_id",
                          {
                            $cond: [
                              { $isArray: "$$f.chairpersons" },
                              "$$f.chairpersons",
                              [],
                            ],
                          },
                        ],
                      },
                      ["Chairperson"],
                      [],
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    },

    // 6️⃣ Count Ordinance & Resolution
    {
      $addFields: {
        ordinanceCount: {
          $size: {
            $filter: {
              input: "$files",
              as: "f",
              cond: { $eq: ["$$f.category", "Ordinance"] },
            },
          },
        },
        resolutionCount: {
          $size: {
            $filter: {
              input: "$files",
              as: "f",
              cond: { $eq: ["$$f.category", "Resolution"] },
            },
          },
        },
      },
    },

    // 7️⃣ Final format
    {
      $project: {
        fullname: {
          $concat: ["$first_name", " ", "$middle_name", " ", "$last_name"],
        },
        Position: 1,
        term: 1,
        from: { $year: "$term_from" },
        to: { $year: "$term_to" },
        ordinanceCount: 1,
        resolutionCount: 1,
        files: 1,
      },
    },

    { $sort: { fullname: 1 } },
  ]);

  res.status(200).json({
    status: "success",
    data: result,
  });
});

exports.PublicSpecificFilterAuthor = AsyncErrorHandler(
  async (req, res, next) => {
    const { search, detailInfo, Position, page, limit } = req.query;

    // --- Kung walang search at Position, wag muna mag display ---
    if (!search && !Position) {
      return res.status(200).json({
        status: "success",
        currentPage: 1,
        totalPages: 0,
        data: [],
      });
    }

    // --- Pagination ---
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 20;
    const skipNumber = (pageNumber - 1) * limitNumber;

    // --- Current Date ---
    const currentDate = new Date();

    const aggregationPipeline = [];
    const matchStage = {};

    // --- Filters ---
    if (detailInfo) matchStage.detailInfo = detailInfo;
    if (Position) matchStage.Position = Position;

    if (Object.keys(matchStage).length > 0) {
      aggregationPipeline.push({ $match: matchStage });
    }

    // --- IMPORTANT: tanggalin expired terms ---
    aggregationPipeline.push({
      $match: {
        term_to: { $gte: currentDate }, // 🔥 core logic
      },
    });

    // --- Lookup files ---
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

      // --- Add fields ---
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

          // ✅ FIX: direct date comparison
          isCurrentTerm: {
            $and: [
              { $lte: ["$term_from", currentDate] },
              { $gte: ["$term_to", currentDate] },
            ],
          },
        },
      }
    );

    // --- Search ---
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

    // --- Group ---
    aggregationPipeline.push({
      $group: {
        _id: "$_id",
        fullName: { $first: "$fullName" },
        detailInfo: { $first: "$detailInfo" },
        Position: { $first: "$Position" },
        term_from: { $first: "$term_from" },
        term_to: { $first: "$term_to" },
        isCurrentTerm: { $first: "$isCurrentTerm" },
        priorityNumber: { $first: "$priorityNumber" },
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

        count: {
          $sum: { $cond: [{ $ifNull: ["$files._id", false] }, 1, 0] },
        },

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
    });

    // --- SORT ---
    aggregationPipeline.push({
      $sort: {
        isCurrentTerm: -1,   // current muna
        priorityNumber: 1,   // tapos priority
        term_to: -1,         // tapos latest term
      },
    });

    // --- Pagination ---
    aggregationPipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skipNumber }, { $limit: limitNumber }],
      },
    });

    // --- Execute ---
    const result = await SBmember.aggregate(aggregationPipeline).allowDiskUse(true);

    const totalCount = result[0].metadata[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / limitNumber);

    res.status(200).json({
      status: "success",
      currentPage: pageNumber,
      totalPages,
      data: result[0].data,
    });
  }
);
exports.CategorySummaryWithSize = AsyncErrorHandler(async (req, res) => {
  // ORIGINAL — DO NOT TOUCH
  const summary = await Files.aggregate([
    {
      $match: {
        ArchivedStatus: { $nin: ["For Restore", "Deleted"] },
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
    { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        "categoryInfo.category": { $in: ["Resolution", "Ordinance"] },
      },
    },
    {
      $group: {
        _id: "$categoryInfo.category",
        totalFiles: { $sum: 1 },
        totalFileSize: { $sum: "$fileSize" },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id",
        totalFiles: 1,
        totalFileSize: { $multiply: ["$totalFileSize", 5] },
      },
    },
  ]);

  // 🔹 ADD ONLY — MONTHLY UPLOADS
  const currentYear = new Date().getFullYear();

  const MonthlyUploads = await Files.aggregate([
    {
      $match: {
        ArchivedStatus: { $nin: ["For Restore", "Deleted"] },
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        totalFiles: { $sum: 1 },
        totalFileSize: { $sum: { $ifNull: ["$fileSize", 0] } },
      },
    },
    {
      $project: {
        _id: 0,
        monthNumber: "$_id.month",
        month: {
          $arrayElemAt: [
            [
              "",
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ],
            "$_id.month",
          ],
        },
        totalFiles: 1,
        totalFileSize: { $multiply: ["$totalFileSize", 5] },
      },
    },
    { $sort: { monthNumber: 1 } },
  ]);

  res.status(200).json({
    status: "success",
    data: summary,
    MonthlyUploads,
  });
});


exports.DisplayByPositionInFile = AsyncErrorHandler(async (req, res) => {
  const {
    _id: filterId,
    positionFile,
    search = "",
    page = 1,
    limit = 5
  } = req.query;

  if (!filterId || !positionFile) {
    return res.status(400).json({
      status: "fail",
      message: "_id and positionFile are required",
    });
  }

  const currentPage = Math.max(parseInt(page), 1);
  const perPage = Math.max(parseInt(limit), 1);
  const skip = (currentPage - 1) * perPage;

  const filterObjectId = new mongoose.Types.ObjectId(filterId);

  const positionMap = {
    chairperson: "chairpersons",
    member: "members",
    "vice-chairperson": "viceChairpersons",
    vicechairperson: "viceChairPersons",
  };

  const field = positionMap[positionFile.toLowerCase()];
  if (!field) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid positionFile value",
    });
  }

  /** ⬇️ DAGDAG LANG DITO */
  const matchStage = {
    [field]: { $elemMatch: { $eq: filterObjectId } },
    ArchivedStatus: { $nin: ["Deleted", "For Restore"] },
  };

  if (search.trim()) {
    matchStage.$or = [
      { title: { $regex: search, $options: "i" } },
      { fileNumber: { $regex: search, $options: "i" } },
    ];
  }

  /** ⬇️ TOTAL COUNT (HIWALAY, WALANG GALAW SA MAIN PIPELINE) */
  const totalData = await Files.countDocuments(matchStage);
  const totalPage = Math.ceil(totalData / perPage);

  const files = await Files.aggregate([
    { $match: matchStage },

    {
      $lookup: {
        from: "sbmembers",
        localField: "chairpersons",
        foreignField: "_id",
        as: "chairpersonInfo",
      },
    },
    {
      $lookup: {
        from: "sbmembers",
        localField: "members",
        foreignField: "_id",
        as: "membersInfo",
      },
    },
    {
      $lookup: {
        from: "sbmembers",
        localField: "viceChairPersons",
        foreignField: "_id",
        as: "viceChairpersonInfo",
      },
    },

    {
      $addFields: {
        chairpersons: {
          $cond: [
            { $eq: [field, "chairpersons"] },
            { $filter: { input: "$chairpersons", as: "c", cond: { $eq: ["$$c", filterObjectId] } } },
            "$chairpersons",
          ],
        },
        members: {
          $cond: [
            { $eq: [field, "members"] },
            { $filter: { input: "$members", as: "m", cond: { $eq: ["$$m", filterObjectId] } } },
            "$members",
          ],
        },
        viceChairPersons: {
          $cond: [
            { $eq: [field, "viceChairPersons"] },
            { $filter: { input: "$viceChairPersons", as: "v", cond: { $eq: ["$$v", filterObjectId] } } },
            "$viceChairPersons",
          ],
        },
      },
    },

    /** ⬇️ DAGDAG LANG ITO */
    { $skip: skip },
    { $limit: perPage },
  ]);

  res.status(200).json({
    status: "success",
    totalData,
    currentPage,
    totalPage,
    limit: perPage,
    results: files.length,
    data: files,
  });
});
