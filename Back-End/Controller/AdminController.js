const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Admin = require("../Models/AdminSchema");
const cloudinary = require("../Utils/cloudinary");
const UserLoginSchema = require("../Models/LogInDentalSchema");

exports.deleteAdmin = AsyncErrorHandler(async (req, res, next) => {
  const AdminID = req.params.id;
  const userLogin = await UserLoginSchema.findOne({ linkedId: AdminID });
  if (userLogin) {
    await UserLoginSchema.findByIdAndDelete(userLogin._id);
  }
  const deleteAdmin = await Admin.findByIdAndDelete(AdminID);
  if (!deleteAdmin) {
    return res.status(404).json({
      status: "fail",
      message: "Officer not found.",
    });
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
    let uploadPromise;
    let avatar;

    if (req.file) {
      // Prepare Cloudinary upload in parallel
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      uploadPromise = cloudinary.uploader.upload(base64Image, {
        folder: "Government Archiving/Profile",
      });

      // Delete old avatar in the background
      Admin.findById(adminId).then((oldRecord) => {
        if (oldRecord?.avatar?.public_id) {
          cloudinary.uploader.destroy(oldRecord.avatar.public_id).catch((err) => {
            console.error("Failed to delete old image:", err);
          });
        }
      });
    }

    // Wait for upload only if new file is provided
    if (uploadPromise) {
      const uploadedResponse = await uploadPromise;
      avatar = {
        public_id: uploadedResponse.public_id,
        url: uploadedResponse.secure_url,
      };
    }

    const updateData = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      middle_name: req.body.middle_name,
      email: req.body.email,
      gender: req.body.gender,
      ...(avatar && { avatar }), // Only include avatar if updated
    };

    // Single DB update
    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updateData, { new: true });

    if (!updatedAdmin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({ status: "success", data: updatedAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};





