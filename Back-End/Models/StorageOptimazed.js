const mongoose = require('mongoose');

const StorageOptimizationSettingSchema = new mongoose.Schema({
  deleteAfterDays: {  // renamed from retentionDays
    type: Number,
    required: true,
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StorageOptimizationSetting', StorageOptimizationSettingSchema);
