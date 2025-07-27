const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Notification = require("./../Models/NotificationSchema");
const ApiFeatures = require("./../Utils/ApiFeatures");
const mongoose = require("mongoose");

exports.createNotification = AsyncErrorHandler(async (req, res) => {
  const { message, userIds } = req.body; // userIds: [array of linkId]

  const viewers = userIds.map((id) => ({
    user: new mongoose.Types.ObjectId(id),
    isRead: false,
  }));

  const newNotification = await Notification.create({ message, viewers });

  res.status(201).json({
    status: "success",
    data: newNotification,
  });
});

exports.getByLinkId = AsyncErrorHandler(async (req, res) => {
  const { linkId } = req.params;

  const notifications = await Notification.find({
    "viewers.user": linkId,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    data: notifications,
  });
});


exports.markAsRead = AsyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const { linkId } = req.body;

  if (!linkId) {
    return res.status(400).json({ message: "linkId is required" });
  }

  const notification = await Notification.findById(id);
  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  const viewer = notification.viewers.find(
    (v) => v.user.toString() === linkId
  );

  if (!viewer) {
    return res.status(403).json({ message: "Not authorized to read this notification" });
  }

  if (!viewer.isRead) {
    viewer.isRead = true;
    await notification.save();
  }

  res.status(200).json({ message: "Notification marked as read" });
});


exports.DisplayNotification = AsyncErrorHandler(async (req, res) => {
  const features = new ApiFeatures(Notification.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const dataNotification = await features.query;

  res.status(200).json({
    status: "success",
    data: dataNotification,
  });
});


exports.deleteNotification = AsyncErrorHandler(async (req, res) => {
  const deleted = await Notification.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      status: "fail",
      message: "Notification not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});
