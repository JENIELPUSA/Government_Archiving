const cron = require('node-cron');
const runRetentionArchiveJob = require('../runRetentionArchiveJob');
const deleteOldNotifications = require("../deleteOldNotification");
const deleteOldDraftFiles = require("../deleteOldDraftFiles")

const scheduleRetentionJob = () => {
  //cron.schedule('*/2 * * * *', async () => {
  cron.schedule('0 1 * * *', async () => {
    console.log('⏰ Running scheduled retention archive job...');
    await runRetentionArchiveJob();
    await deleteOldNotifications();
    await deleteOldDraftFiles();
  });
};

module.exports = scheduleRetentionJob;
