const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Officer = require("../Models/OfficerSchema");
const Apifeatures = require("../Utils/ApiFeatures");
const UserLoginSchema = require("../Models/LogInDentalSchema");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

exports.DisplayOfficer = AsyncErrorHandler(async (req, res) => {
  const officer = await Officer.aggregate([
    {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "departmentInfo",
      },
    },
    {
      $unwind: {
        path: "$departmentInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        first_name: 1,
        last_name: 1,
        middle_name: 1,
        email: 1,
        gender: 1,
        avatar: 1,
        created_at: 1,
        dob: 1,
        department: "$departmentInfo.department",
      },
    },
  ]);

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
    totalUsers: formattedOfficer.length,
  });
});

exports.deleteOfficer = AsyncErrorHandler(async (req, res, next) => {
  const officerID = req.params.id;
  const userLogin = await UserLoginSchema.findOne({ linkedId: officerID });
  if (userLogin) {
    await UserLoginSchema.findByIdAndDelete(userLogin._id);
  }
  const deleteOfficer = await Officer.findByIdAndDelete(officerID);
  if (!deleteOfficer) {
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

exports.UpdateOfficer = AsyncErrorHandler(async (req, res, next) => {
  const officerId = req.params.id;

  const oldRecord = await Officer.findById(officerId);
  if (!oldRecord) {
    return res.status(404).json({ error: "Officer not found" });
  }

  let newAvatarUrl = oldRecord.avatar ? oldRecord.avatar.url : null;
  const oldAvatarUrl = oldRecord.avatar ? oldRecord.avatar.url : null;

  if (req.file) {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!allowedTypes.includes(req.file.mimetype)) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete invalid temp file:", err);
      });

      return res.status(400).json({ error: "Invalid image type" });
    }
  }

  try {
    if (req.file) {
      const form = new FormData();
      form.append("file", fs.createReadStream(req.file.path), {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const uploadResponse = await axios.post(
        "https://bp-sangguniangpanlalawigan.com/upload.php",
        form,
        {
          headers: form.getHeaders(),
          maxBodyLength: Infinity,
        },
      );

      if (!uploadResponse.data.success) {
        throw new Error(
          uploadResponse.data.message || "Failed to upload image",
        );
      }

      newAvatarUrl = uploadResponse.data.url;
      console.log("New officer image uploaded:", newAvatarUrl);
    }

    const updateData = {
      ...req.body,
    };

    if (req.file) {
      updateData.avatar = {
        ...oldRecord.avatar,
        url: newAvatarUrl,
      };
    }

    const updatedOfficer = await Officer.findByIdAndUpdate(
      officerId,
      updateData,
      { new: true },
    );

    if (!updatedOfficer) {
      return res.status(404).json({ error: "Officer not found after update" });
    }

    res.status(200).json({
      status: "success",
      data: updatedOfficer,
    });

  
    if (req.file && oldAvatarUrl) {
      const params = new URLSearchParams();
      params.append("file", oldAvatarUrl);

      axios
        .post(
          "https://bp-sangguniangpanlalawigan.com/delete.php",
          params.toString(),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
        )
        .then((response) => {
          if (response.data.success) {
            console.log("Old officer image deleted:", oldAvatarUrl);
          } else {
            console.error(
              "Failed to delete old officer image:",
              response.data.message,
            );
          }
        })
        .catch((error) => {
          console.error("Error deleting old officer image:", error.message);
        });
    }
  } catch (error) {
    console.error("UpdateOfficer Error:", error);
    return res.status(500).json({
      error: "Something went wrong.",
    });
  } finally {

    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
      });
    }
  }
});
