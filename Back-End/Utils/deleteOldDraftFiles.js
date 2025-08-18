const path = require("path");
const StorageOptimized = require("../Models/StorageOptimazed");
const File = require("../Models/File");
const cloudinary = require("cloudinary").v2;

const deleteOldDraftFiles = async () => {
  const setting = await StorageOptimized.findOne();

  if (setting?.enabled && !isNaN(setting.deleteAfterDays)) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - setting.deleteAfterDays);

    const oldFiles = await File.find({
      createdAt: { $lt: daysAgo },
      status: "Pending",
      ArchivedStatus: "Deleted",
    });

    let deletedCount = 0;

    for (const file of oldFiles) {
      try {
        const category =
          typeof file.category === "object" && file.category !== null
            ? file.category._id || file.category.toString()
            : file.category || "Uncategorized"; 

        const ext = path.extname(file.fileName);
        const baseFileName = file.fileName.replace(ext, "");
        const publicId = `Government Archiving/${category}/${baseFileName}`;

        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });

        await File.findByIdAndDelete(file._id);

        deletedCount++;
      } catch (err) {
        console.error(`Failed to delete file ${file._id}:`, err.message);
      }
    }

    console.log(`Deleted ${deletedCount} old draft files (Cloudinary + DB).`);
    return deletedCount;
  } else {
    console.log("Optimization is disabled or invalid setting.");
    return 0;
  }
};

module.exports = deleteOldDraftFiles;
