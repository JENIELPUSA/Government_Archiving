const Comment = require("../Models/Comment");
const mongoose = require("mongoose");
const Apifeatures = require("./../Utils/ApiFeatures");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const UserLoginSchema = require("../Models/LogInDentalSchema")
const Notification = require("../Models/NotificationSchema"); // siguraduhing tama ang path

exports.createComment = AsyncErrorHandler(async (req, res) => {
  try {
    const { pdfId, commentText } = req.body;

    // 1. Create comment
    const newComment = new Comment({
      pdfId,
      commentText,
    });

    await newComment.save();
    const adminUsers = await UserLoginSchema.find({ role: "admin" });
    const io = req.app.get("io");
    const viewersArray = adminUsers.map((adminUser) => ({
      user: new mongoose.Types.ObjectId(adminUser.linkedId),
      isRead: false,
      viewedAt: null,
    }));
    const messageText = `📄 A new comment was added on a file.`;
    const SendMessage = {
      message: messageText,
      data: newComment,
    };


    await Notification.create({
      message: messageText,
      viewers: viewersArray,
    });

    adminUsers.forEach((adminUser) => {
      const adminId = adminUser.linkedId?.toString(); 
      const targetUser = global.connectedUsers?.[adminId];

      console.log(`👤 Admin linkedId: ${adminId}, Email: ${adminUser.username}`);

      if (targetUser) {
        io.to(targetUser.socketId).emit("SentDocumentNotification", SendMessage);
        console.log(`📨 Sent document notification to online admin (${adminId})`);
      } else {
        console.log(`📭 Admin (${adminId}) is offline. Notification saved.`);
      }
    });

    res.status(201).json({
      status: "success",
      message: "Comment created and notification sent",
      data: newComment,
    });
  } catch (error) {
    console.error("❌ Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

exports.getCommentsByPdfId = AsyncErrorHandler(async (req, res) => {
  try {
    const { pdfId } = req.body; // ✅ galing sa body
    console.log("PDF ID from body:", pdfId);

    const comments = await Comment.find({ 
      pdfId, 
      status: "Approved" // ✅ filtering only approved comments 
    }).sort({ timestamp: -1 });

    console.log("Approved comments found:", comments);

    res.status(200).json({
      status: "success",
      message: "Approved comments fetched successfully",
      data: comments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching approved comments",
    });
  }
});



exports.deleteComment = AsyncErrorHandler(async (req, res) => {
  try {
    const { commentId } = req.params;

    const deleted = await Comment.findByIdAndDelete(commentId);

    if (!deleted) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

exports.UpdateStatus = AsyncErrorHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.status(200).json({
      status:"success",
      message: "Comment status updated successfully",
      updatedComment 
    });
  } catch (error) {
    console.error("Error updating comment status:", error);
    res.status(500).json({ error: "Failed to update comment status" });
  }
});

exports.DisplayAllComponents = AsyncErrorHandler(async (req, res) => {
  const features = new Apifeatures(Comment.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const Comments = await features.query;

  res.status(200).json({
    status: "success",
    data: Comments,
  });
});



