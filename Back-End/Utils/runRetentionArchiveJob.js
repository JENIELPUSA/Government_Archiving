const File = require('../Models/File');
const RetentionSetting = require('../Models/RetentionSetting');

const runRetentionArchiveJob = async () => {
  const setting = await RetentionSetting.findOne({ enabled: true });

  if (!setting) {
    console.log('Cron skipped: No active (enabled) retention setting.');
    return;
  }

  const retentionDays = setting.retentionDays;
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  // Gamit aggregation para i-join sa Category at i-filter
  const filesToArchive = await File.aggregate([
    {
      $match: {
        status: { $in: ['Approved', 'Rejected'] },
        ArchivedStatus: { $ne: 'Archived' },
        createdAt: { $lte: cutoffDate },
      },
    },
    {
      $lookup: {
        from: 'categories', // collection name (auto plural ng "Category")
        localField: 'category',
        foreignField: '_id',
        as: 'categoryData',
      },
    },
    { $unwind: '$categoryData' },
    {
      $match: {
        'categoryData.category': { $nin: ['Resolution', 'Ordinance'] },
      },
    },
  ]);

  // I-update lahat ng eligible files
  for (const file of filesToArchive) {
    await File.findByIdAndUpdate(file._id, { ArchivedStatus: 'Archived' });
  }

  console.log(
    `Cron finished: ${filesToArchive.length} file(s) archived (excluding Resolution/Ordinance).`
  );
};

module.exports = runRetentionArchiveJob;
