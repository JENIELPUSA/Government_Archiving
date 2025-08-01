const File = require('../Models/File');
const RetentionSetting = require('../Models/RetentionSetting');
const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const Apifeatures = require('../Utils/ApiFeatures');
exports.setRetentionAndArchiveOldFiles = AsyncErrorHandler(async (req, res) => {
  const { retentionDays, enabled } = req.body;

  if (!retentionDays || isNaN(retentionDays)) {
    return res.status(400).json({ message: 'Invalid retentionDays' });
  }

  const allSettings = await RetentionSetting.find();
  let updatedSetting;

  if (allSettings.length > 0) {
    const settingToUpdate = allSettings[0];
    settingToUpdate.retentionDays = retentionDays;
    settingToUpdate.enabled = enabled;
    updatedSetting = await settingToUpdate.save();
  } else {
    updatedSetting = await RetentionSetting.create({
      retentionDays,
      enabled: enabled ?? true, // fallback to true kung undefined
    });
  }

  let archivedCount = 0;
  if (enabled) {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const filesToArchive = await File.find({
      ArchivedStatus: { $ne: 'Archived' },
      createdAt: { $lte: cutoffDate },
    });

    for (const file of filesToArchive) {
      file.ArchivedStatus = 'Archived';
      await file.save();
      console.log(`Archived: ${file.filename}`);
      archivedCount++;
    }
  }

  res.json({
    status: "success",
    message: `${archivedCount} old file(s) archived.`,
    data: updatedSetting,
    updated: true,
  });
});



exports.DisplayRetention = AsyncErrorHandler(async(req,res)=>{
    const features= new Apifeatures(RetentionSetting.find(),req.query)
                                .filter()
                                .sort()
                                .limitFields()
                                .paginate()

    const Retention = await features.query;


    res.status(200).json({
        status:'success',
        data:Retention[0]
    })

})
