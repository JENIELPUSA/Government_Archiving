const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Admin = require("../Models/AdminSchema");
const Apifeatures = require("../Utils/ApiFeatures");
const LogActionAudit = require("../Models/LogActionAudit");
const fs = require("fs");
const path = require("path");


exports.DisplayAdmin = AsyncErrorHandler(async (req, res) => {
  const features = new Apifeatures(Admin.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const adminResults = await features.query;

  res.status(200).json({
    status: "success",
    data: adminResults,
    totalAdmin:adminResults.length
  });
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

exports.deleteAdmin = AsyncErrorHandler(async (req, res, next) => {
  const AdminID = req.params.id;
  const deleteAdmin = await Admin.findByIdAndDelete(AdminID);

  if (!deleteAdmin) {
    return res.status(404).json({
      status: "fail",
      message: "Officer not found.",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Officer deleted successfully.",
    data: null,
  });
});


exports.UpdateAdmin =AsyncErrorHandler(async (req,res,next) =>{
    const updateAdmin=await Admin.findByIdAndUpdate(req.params.id,req.body,{new: true});
     res.status(200).json({
        status:'success',
        data:
            updateAdmin
        
     }); 
  })





