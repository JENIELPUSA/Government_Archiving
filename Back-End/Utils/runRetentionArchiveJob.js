const File = require('../Models/File');
const RetentionSetting = require('../Models/RetentionSetting');

const runRetentionArchiveJob = async () => {
  const setting = await RetentionSetting.findOne({ enabled: true });

  if (!setting) {
    console.log('⛔ Cron skipped: No active (enabled) retention setting.');
    return;
  }

  const retentionDays = setting.retentionDays;
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  const filesToArchive = await File.find({
    status: { $in: ['Approved', 'Rejected'] },
    ArchivedStatus: { $ne: 'Archived' },
    createdAt: { $lte: cutoffDate },
  });

  for (const file of filesToArchive) {
    file.ArchivedStatus = 'Archived';
    await file.save();
  }

  console.log(`📁 Cron finished: ${filesToArchive.length} file(s) archived (status: Approved/Rejected, older than ${retentionDays} days).`);
};

module.exports = runRetentionArchiveJob;
