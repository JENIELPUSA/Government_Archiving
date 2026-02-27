const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Admin = require("../Models/AdminSchema");
const UserLoginSchema = require("../Models/LogInDentalSchema");
const fs = require("fs");
const axios = require("axios");
const { URLSearchParams } = require("url");
const FormData = require("form-data");

exports.deleteAdmin = AsyncErrorHandler(async (req, res, next) => {
  const AdminID = req.params.id;

  const existingAdmin = await Admin.findById(AdminID);
  if (!existingAdmin) {
    return res.status(404).json({
      status: "fail",
      message: "Admin not found.",
    });
  }

  // Hakbang 1: Tanggalin ang admin record at ang UserLogin record
  const userLogin = await UserLoginSchema.findOne({ linkedId: AdminID });
  if (userLogin) {
    await UserLoginSchema.findByIdAndDelete(userLogin._id);
  }

  await Admin.findByIdAndDelete(AdminID);

  // Hakbang 2: Agad na magbigay ng success response sa user
  res.status(200).json({
    status: "success",
    message: "Admin and related login deleted successfully.",
    data: null,
  });

  // Hakbang 3: I-delete ang avatar file sa background
  if (existingAdmin.avatar && existingAdmin.avatar.url) {
    const avatarUrl = existingAdmin.avatar.url;

    // "Fire and forget" ang delete request
    const params = new URLSearchParams();
    params.append("file", avatarUrl);

    axios
      .post(
        "https://bp-sangguniangpanlalawigan.com/delete.php",
        params.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      )
      .then((response) => {
        if (response.data.success) {
          console.log(
            "Avatar deleted from Hostinger in background:",
            avatarUrl,
          );
        } else {
          console.error(
            "Failed to delete avatar from Hostinger in background:",
            response.data.message,
          );
        }
      })
      .catch((error) => {
        console.error(
          "Error deleting avatar from Hostinger in background:",
          error.message,
        );
      });
  }
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
const Officer = require("../Models/OfficerSchema");

exports.UpdateAdmin = AsyncErrorHandler(async (req, res) => {
  console.log("req", req.body);
  const id = req.params.id;

  // Hanapin muna sa Officer
  let record = await Officer.findById(id);
  let collectionType = "Officer";

  // Kung wala sa Officer, hanapin sa Admin
  if (!record) {
    record = await Admin.findById(id);
    collectionType = "Admin";
  }

  // Kung wala sa parehong collection
  if (!record) {
    return res
      .status(404)
      .json({ error: "Record not found in Officer or Admin" });
  }

  let newAvatarUrl = record.avatar ? record.avatar.url : null;
  const oldAvatarUrl = record.avatar ? record.avatar.url : null;

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
    // Upload avatar if provided
    if (req.file) {
      const form = new FormData();
      form.append("file", fs.createReadStream(req.file.path), {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const uploadResponse = await axios.post(
        "https://bp-sangguniangpanlalawigan.com/upload.php",
        form,
        { headers: form.getHeaders(), maxBodyLength: Infinity },
      );

      if (!uploadResponse.data.success) {
        throw new Error(
          uploadResponse.data.message || "Failed to upload new avatar",
        );
      }

      newAvatarUrl = uploadResponse.data.url;
      console.log("New avatar uploaded:", newAvatarUrl);
    }

    const updateData = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      middle_name: req.body.middle_name,
      email: req.body.email,
      gender: req.body.gender,
    };

    if (req.file) {
      updateData.avatar = { ...record.avatar, url: newAvatarUrl };
    }

    // Update depende sa collection kung saan nakita
    let updatedRecord;
    if (collectionType === "Officer") {
      updatedRecord = await Officer.findByIdAndUpdate(id, updateData, {
        new: true,
      });
    } else {
      updatedRecord = await Admin.findByIdAndUpdate(id, updateData, {
        new: true,
      });
    }

    res.json({ status: "success", data: updatedRecord });

    // Delete old avatar in background
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
            console.log("Old avatar deleted:", oldAvatarUrl);
          } else {
            console.error(
              "Failed to delete old avatar:",
              response.data.message,
            );
          }
        })
        .catch((error) => {
          console.error("Error deleting old avatar:", error.message);
        });
    }
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Something went wrong." });
  } finally {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
      });
    }
  }
});
