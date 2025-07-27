const StorageOptimized = require("../Models/StorageOptimazed");
const File = require("../Models/File");

const deleteOldDraftFiles = async () => {
  const setting = await StorageOptimized.findOne();

  if (setting?.enabled && !isNaN(setting.deleteAfterDays)) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - setting.deleteAfterDays);

    const result = await File.deleteMany({
      createdAt: { $lt: daysAgo },
      status: "Draft",
    });

    console.log(`Deleted ${result.deletedCount} old draft files.`);
    return result.deletedCount;
  } else {
    console.log("Optimization is disabled or invalid setting.");
    return 0;
  }
};

module.exports = deleteOldDraftFiles;
