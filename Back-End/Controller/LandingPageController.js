const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const LandingPage = require("../Models/LandingPageAssets");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

exports.saveLandingPage = AsyncErrorHandler(async (req, res) => {
  try {
    const { title, subtitle, Mission, Vission } = req.body;

    // Parse incoming avatars from request body if present
    let incomingAvatars = [];
    if (req.body.avatar) {
      try {
        incomingAvatars =
          typeof req.body.avatar === "string"
            ? JSON.parse(req.body.avatar)
            : req.body.avatar;

        // Filter out invalid or blob URLs
        incomingAvatars = incomingAvatars.filter(
          (img) => img.url && !img.url.startsWith("blob:")
        );
      } catch (err) {
        console.warn("Invalid avatar JSON, skipping:", err.message);
      }
    }

    // Handle uploaded files (array or fields)
    const files = req.files;
    if (files) {
      const fileArray = Array.isArray(files) ? files : files.avatar;

      if (fileArray?.length) {
        for (const file of fileArray) {
          const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
          if (!allowedTypes.includes(file.mimetype)) {
            if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
            continue;
          }

          try {
            if (file.path) {
              const form = new FormData();
              form.append("file", fs.createReadStream(file.path), {
                filename: file.originalname,
                contentType: file.mimetype,
              });

              const uploadResponse = await axios.post(process.env.UPLOAD_URL, form, {
                headers: form.getHeaders(),
                maxBodyLength: Infinity,
              });

              if (uploadResponse.data.success) {
                incomingAvatars.push({
                  url: uploadResponse.data.url,
                  public_id: uploadResponse.data.public_id || Date.now(),
                });
                console.log("✅ Uploaded avatar:", uploadResponse.data.url);
              }
            } else if (file.buffer) {
              incomingAvatars.push({
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                public_id: Date.now(),
              });
            }
          } catch (uploadError) {
            console.error("❌ Upload failed:", uploadError.message);
          } finally {
            if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
          }
        }
      }
    }

    // Find existing landing page or create new
    let landing = await LandingPage.findOne();
    if (!landing) {
      landing = await LandingPage.create({
        ...(title && { title }),
        ...(subtitle && { subtitle }),
        ...(Mission && { Mission }),
        ...(Vission && { Vission }),
        ...(incomingAvatars.length && { avatar: incomingAvatars }),
      });
    } else {
      // Update only fields that have a value
      if (title) landing.title = title;
      if (subtitle) landing.subtitle = subtitle;
      if (Mission) landing.Mission = Mission;
      if (Vission) landing.Vission = Vission;
      if (incomingAvatars.length) landing.avatar = incomingAvatars;

      await landing.save();
    }

    res.status(200).json({
      status: "success",
      data: landing,
    });
  } catch (error) {
    console.error("Error in saveLandingPage:", error);
    res.status(500).json({
      status: "failed",
      message: error.message || "Something went wrong while saving the landing page.",
    });
  }
});

exports.DisplayLandingPage = AsyncErrorHandler(async (req, res) => {
  try {
    // Fetch the landing page (single document)
    const Landing = await LandingPage.findOne(); // or { Display: true } if you want only visible

    res.status(200).json({
      status: 'success',
      data: Landing
    });
  } catch (error) {
    console.error("Error fetching Landing:", error);
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while fetching Landing',
      error: error.message
    });
  }
});