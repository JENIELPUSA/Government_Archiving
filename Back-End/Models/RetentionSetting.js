const mongoose = require('mongoose');

const RetentionSettingSchema = new mongoose.Schema({
  retentionDays: {
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

module.exports = mongoose.model('RetentionSetting', RetentionSettingSchema);
