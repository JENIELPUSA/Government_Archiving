const StorageOptimization = require("../Models/StorageOptimazed");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Apifeatures = require('../Utils/ApiFeatures');
exports.storageOptimization = AsyncErrorHandler(async (req, res) => {
  const { limitdays, enabled } = req.body;

  if (limitdays === undefined || isNaN(Number(limitdays))) {
    return res.status(400).json({ message: "Invalid limitdays" });
  }

  let updatedSetting;

  const existingSetting = await StorageOptimization.findOne();
  if (existingSetting) {
    existingSetting.deleteAfterDays = Number(limitdays);
    existingSetting.enabled = enabled;
    updatedSetting = await existingSetting.save();
  } else {
    updatedSetting = await StorageOptimization.create({
      deleteAfterDays: Number(limitdays),
      enabled: enabled ?? true,
    });
  }

  res.status(200).json({
    status: "success",
    message: "Storage optimization setting saved successfully.",
    data: updatedSetting,
  });
});


exports.DisplayStorageOptimizer = AsyncErrorHandler(async(req,res)=>{
    const features= new Apifeatures(StorageOptimization.find(),req.query)
                                .filter()
                                .sort()
                                .limitFields()
                                .paginate()

    const Optimizer = await features.query;


    res.status(200).json({
        status:'success',
        data:Optimizer[0]
    })

})
