const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Admin = require("../Models/AdminSchema");
const UserLoginSchema = require("../Models/LogInDentalSchema");
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
exports.deleteAdmin = AsyncErrorHandler(async (req, res, next) => {
  const AdminID = req.params.id;

  const existingAdmin = await Admin.findById(AdminID);
  if (!existingAdmin) {
    return res.status(404).json({
      status: "fail",
      message: "Officer not found.",
    });
  }

  if (existingAdmin.avatar && existingAdmin.avatar.url) {
    const fileName = path.basename(existingAdmin.avatar.url);
    const filePath = path.join(uploadsDir, fileName);

    try {
      await fs.promises.unlink(filePath); // Corrected: use fs.promises.unlink
    } catch (error) {
      console.error("Local file deletion failed:", error);
    }
  }

  const userLogin = await UserLoginSchema.findOne({ linkedId: AdminID });
  if (userLogin) {
    await UserLoginSchema.findByIdAndDelete(userLogin._id);
  }

  const deleteAdmin = await Admin.findByIdAndDelete(AdminID);
  if (!deleteAdmin) {
    // This part of the code is unreachable since we already checked for the user above
  }

  res.status(200).json({
    status: "success",
    message: "Officer and related login deleted successfully.",
    data: null,
  });
});


exports.DisplayAdmin = AsyncErrorHandler(async (req, res) => {
  try {
    const adminResults = await Admin.find();

    res.status(200).json({
      status: "success",
      data: adminResults,
      totalAdmin: adminResults.length,
    });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong while fetching admin data.",
      error: error.message,
    });
  }
});


exports.DisplayProfile = AsyncErrorHandler(async (req, res) => {
  const loggedInAdminId = req.user.linkId;
  const admin = await Admin.findById(loggedInAdminId);
  if (!admin) {
    return res.status(404).json({
      status: "fail",
      message: "Admin not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: admin,
  });
});

exports.UpdateAdmin = async (req, res) => {
  const adminId = req.params.id;

  try {
    const oldRecord = await Admin.findById(adminId);
    if (!oldRecord) {
      return res.status(404).json({ error: "Admin not found" });
    }

    let avatarPath = oldRecord.avatar?.url || null;

    if (req.file) {
      const newFilePath = req.file.path;
      const fileName = path.basename(newFilePath);
      avatarPath = `/uploads/${fileName}`;

      // Step 1: I-delete ang lumang avatar
      if (oldRecord.avatar?.url) {
        const oldFileName = path.basename(oldRecord.avatar.url);
        const oldFilePath = path.join(uploadsDir, oldFileName);
        
        try {
          await fs.promises.unlink(oldFilePath);
        } catch (err) {
          console.error("Failed to delete old image:", err.message);
        }
      }
    }

    const updateData = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      middle_name: req.body.middle_name,
      email: req.body.email,
      gender: req.body.gender,
      ...(req.file && { avatar: { url: avatarPath } }),
    };

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updateData, { new: true });

    if (!updatedAdmin) {
      return res.status(404).json({ error: "Admin not found after update" });
    }

    res.json({ status: "success", data: updatedAdmin });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};





