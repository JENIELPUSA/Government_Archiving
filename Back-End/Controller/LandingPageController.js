const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const LandingPage = require("../Models/LandingPageAssets");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

// Helper: upload dataURL to external image service
const uploadDataUrl = async (dataUrl) => {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) throw new Error("Invalid data URL");
  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, "base64");

  let ext = ".jpg";
  if (mimeType.includes("png")) ext = ".png";
  else if (mimeType.includes("webp")) ext = ".webp";

  const tempDir = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  const tempFilePath = path.join(tempDir, `upload_${Date.now()}_${Math.random()}${ext}`);
  fs.writeFileSync(tempFilePath, buffer);

  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(tempFilePath), {
      filename: `image${ext}`,
      contentType: mimeType,
    });
    const uploadResponse = await axios.post(process.env.UPLOAD_URL, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });
    if (uploadResponse.data.success) {
      return {
        url: uploadResponse.data.url,
        public_id: uploadResponse.data.public_id || Date.now().toString(),
      };
    } else {
      throw new Error("Upload service error");
    }
  } finally {
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
  }
};

// Helper: delete image from external service
const deleteImageFromService = async (public_id) => {
  if (!public_id) return false;
  try {
    await axios.delete(`${process.env.UPLOAD_URL}/${public_id}`);
    console.log(`✅ Deleted image ${public_id}`);
    return true;
  } catch (error) {
    console.error(`❌ Delete failed ${public_id}:`, error.message);
    return false;
  }
};

exports.saveLandingPage = AsyncErrorHandler(async (req, res) => {
  try {
    const { title, subtitle, Mission, Vission, new_images, existing_images } = req.body;

    // 1. Upload new images (dataURLs)
    const uploadedNew = [];
    if (new_images && Array.isArray(new_images)) {
      for (const dataUrl of new_images) {
        try {
          const uploaded = await uploadDataUrl(dataUrl);
          uploadedNew.push(uploaded);
        } catch (err) {
          console.error("Upload error:", err.message);
        }
      }
    }

    // 2. Build final avatar array (existing + new)
    let finalAvatars = [];

    if (existing_images && Array.isArray(existing_images)) {
      finalAvatars = existing_images.map(url => ({
        url: url,
        public_id: url.split("/").pop() || Date.now().toString(),
      }));
    }

    finalAvatars.push(...uploadedNew);

    // 3. Assign priorityNumber based on order (index)
    finalAvatars = finalAvatars.map((img, idx) => ({ ...img, priorityNumber: idx }));

    // 4. Get current landing page for deletion
    const existingLanding = await LandingPage.findOne();
    const oldPublicIds = existingLanding?.avatar?.map(a => a.public_id) || [];
    const newPublicIds = finalAvatars.map(a => a.public_id).filter(id => id);
    const toDelete = oldPublicIds.filter(id => !newPublicIds.includes(id));

    // 5. Delete images no longer in the new list
    for (const publicId of toDelete) {
      await deleteImageFromService(publicId);
    }

    // 6. Save or update landing page
    let landing = existingLanding;
    if (!landing) {
      landing = new LandingPage({
        title: title || "",
        subtitle: subtitle || "",
        Mission: Mission || "",
        Vission: Vission || "",
        avatar: finalAvatars,
      });
    } else {
      landing.title = title ?? landing.title;
      landing.subtitle = subtitle ?? landing.subtitle;
      landing.Mission = Mission ?? landing.Mission;
      landing.Vission = Vission ?? landing.Vission;
      landing.avatar = finalAvatars;
    }
    await landing.save();

    res.status(200).json({ status: "success", data: landing });
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
});

exports.DisplayLandingPage = AsyncErrorHandler(async (req, res) => {
  const landing = await LandingPage.findOne();
  res.status(200).json({ status: "success", data: landing });
});