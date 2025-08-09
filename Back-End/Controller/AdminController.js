const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Admin = require("../Models/AdminSchema");
const Apifeatures = require("../Utils/ApiFeatures");
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

exports.UpdateAdmin = AsyncErrorHandler(async (req, res, next) => {
  const updateAdmin = await Admin.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json({
    status: "success",
    data: updateAdmin,
  });
});
