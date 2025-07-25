const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Officer = require("../Models/OfficerSchema");
const Apifeatures = require("../Utils/ApiFeatures");
const LogActionAudit = require("../Models/LogActionAudit");
const fs = require("fs");
const path = require("path");

exports.DisplayOfficer = AsyncErrorHandler(async (req, res) => {
  const officer = await Officer.aggregate([
    {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "departmentInfo"
      }
    },
    {
      $unwind: {
        path: "$departmentInfo",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        first_name: 1,
        last_name: 1,
        email: 1,
        gender: 1,
        avatar: 1,
        created_at: 1,
        dob: 1,
        department: "$departmentInfo.department" // replace with actual field in department
      }
    }
  ]);

  // Optional: Format `dob` if present
  const formattedOfficer = officer.map((off) => {
    if (off.dob) {
      const dob = new Date(off.dob);
      const year = dob.getFullYear();
      const month = String(dob.getMonth() + 1).padStart(2, "0");
      const day = String(dob.getDate()).padStart(2, "0");
      off.dob = `${year}-${month}-${day}`;
    }
    return off;
  });

  res.status(200).json({
    status: "success",
    data: formattedOfficer,
  });
});

exports.deleteOfficer = AsyncErrorHandler(async (req, res, next) => {
  const officerID = req.params.id;
  const deletedOfficer = await Officer.findByIdAndDelete(officerID);

  if (!deletedOfficer) {
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


exports.UpdateOfficer =AsyncErrorHandler(async (req,res,next) =>{
    const updateOfficer=await Officer.findByIdAndUpdate(req.params.id,req.body,{new: true});
     res.status(200).json({
        status:'success',
        data:
            updateOfficer
        
     }); 
  })





