const express = require("express");
const router = express.Router();
const FilesController = require("./../Controller/FilesController");
const authController = require("./../Controller/authController");
const upload = require("../middleware/fileUploader");
router
  .route("/")
  .post(
    authController.protect,
    upload.single("file"),
    FilesController.createFiles
  )
  .get(authController.protect, FilesController.DisplayFiles);

router
  .route("/FilesWithAuthor")
  .get(FilesController.getAllAuthorsWithFiles);


router
  .route("/:id")
  .delete(authController.protect, FilesController.RemoveFiles)
  .patch(authController.protect, FilesController.updateStatus)
  .get(FilesController.getFileById);

router
  .route("/UpdateFileDocument/:id")
  .patch(authController.protect, FilesController.updateFiles);

router.route("/OfficerUpdate/:id").patch(FilesController.updateFileOfficer);

router.get("/stream/:id", authController.protect, FilesController.getFileCloud);

router.get("/streampublic/:id", FilesController.getFileForPubliCloud);

router.get("/check-delivery-type", FilesController.checkDeliveryType);

router
  .route("/UpdateCloudinary")
  .post(
    authController.protect,
    upload.single("file"),
    FilesController.UpdateCloudinaryFile
  );
router
  .route("/GetOfficerData")
  .post(authController.protect, FilesController.getOfficer);


router.get("/test", (req, res) => {
  console.log("🧪 test route hit!");
  res.send("TEST OK");
});

router.route("/GetPublicData").post(FilesController.PublicDisplayController);

router.route("/GetLatestBill").post(FilesController.getLatestBillsThisWeek);

router.route("/GetArchivedData").post(authController.protect,FilesController.DisplayFilesArchive);

router.route("/DocumentPerYear").post(FilesController.DisplayDocumentPerYear);



module.exports = router;
