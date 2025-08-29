const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Admin = require("../Models/AdminSchema");
const UserLoginSchema = require("../Models/LogInDentalSchema");
const axios = require("axios");
const { URLSearchParams } = require("url");
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

    axios.post(
        "https://tan-kudu-520349.hostingersite.com/delete.php",
        params.toString(), {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then(response => {
        if (response.data.success) {
          console.log("Avatar deleted from Hostinger in background:", avatarUrl);
        } else {
          console.error("Failed to delete avatar from Hostinger in background:", response.data.message);
        }
      })
      .catch(error => {
        console.error("Error deleting avatar from Hostinger in background:", error.message);
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

exports.UpdateAdmin = AsyncErrorHandler(async (req, res) => {
  const adminId = req.params.id;

  try {
    const oldRecord = await Admin.findById(adminId);
    if (!oldRecord) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const avatarObj = oldRecord.avatar || {};
    let newAvatarUrl = avatarObj.url || null;
    const oldAvatarUrl = avatarObj.url; // I-store ang lumang URL bago mag-update

    if (req.file) {
      // Step 1: Upload the new avatar
      const form = new FormData();
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
      form.append("file", blob, req.file.originalname);

      const uploadResponse = await axios.post(
        "https://tan-kudu-520349.hostingersite.com/upload.php",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
          maxBodyLength: Infinity,
        }
      );

      if (!uploadResponse.data.success) {
        return res.status(500).json({
          error: uploadResponse.data.message || "Failed to upload new avatar",
        });
      }

      newAvatarUrl = uploadResponse.data.url;
      console.log("New avatar uploaded:", newAvatarUrl);
    }

    // Step 2: Update the database with new data (including new avatar URL if applicable)
    const updateData = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      middle_name: req.body.middle_name,
      email: req.body.email,
      gender: req.body.gender,
    };

    if (req.file) {
      updateData.avatar = {
        ...avatarObj,
        url: newAvatarUrl,
      };
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updateData, {
      new: true,
    });

    if (!updatedAdmin) {
      // Optional: Rollback ng na-upload na file kung may error sa database
      // await deleteUploadedFile(newAvatarUrl); 
      return res.status(404).json({ error: "Admin not found after update" });
    }

    res.json({ status: "success", data: updatedAdmin });

    // Step 3: "Fire and Forget" - I-delete ang lumang avatar sa background
    if (req.file && oldAvatarUrl) {
      const params = new URLSearchParams();
      params.append("file", oldAvatarUrl);

      // Hindi ina-await ang axios call para mag-proceed agad ang code
      axios.post(
        "https://tan-kudu-520349.hostingersite.com/delete.php",
        params.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      ).then(response => {
        if (response.data.success) {
          console.log("Old avatar deleted in background:", oldAvatarUrl);
        } else {
          console.error("Failed to delete old avatar in background:", response.data.message);
        }
      }).catch(error => {
        console.error("Error deleting old avatar in background:", error.message);
      });
    }

  } catch (error) {
    console.error("UpdateAdmin Error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

