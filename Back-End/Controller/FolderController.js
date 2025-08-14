const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Folder = require("./../Models/FolderSchema");
const Files = require("./../Models/File");
const mongoose = require("mongoose");
exports.createFolder = AsyncErrorHandler(async (req, res) => {
  console.log("req.body:", req.body);
  const Folders = await Folder.create(req.body);
  res.status(201).json({
    status: "success",
    data: Folders,
  });
});

exports.DisplayFolder = AsyncErrorHandler(async (req, res) => {
  try {
    const Folders = await Folder.find();

    res.status(200).json({
      status: "success",
      data: Folders,
    });
  } catch (error) {
    console.error("Error fetching Folders:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong while fetching Folders",
      error: error.message,
    });
  }
});

exports.UpdateFolder = AsyncErrorHandler(async (req, res, next) => {
  const updateFolder = await Folder.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json({
    status: "success",
    data: updateFolder,
  });
});

exports.deleteFolder = AsyncErrorHandler(async (req, res, next) => {
  const FolderDoc = await Folder.findById(req.params.id);

  if (!FolderDoc) {
    return res.status(404).json({
      status: "fail",
      message: "Folder not found.",
    });
  }
  await Folder.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.DisplayFolder = AsyncErrorHandler(async (req, res) => {
  try {
    const Folders = await Folder.find();

    res.status(200).json({
      status: "success",
      data: Folders,
    });
  } catch (error) {
    console.error("Error fetching Folders:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong while fetching Folders",
      error: error.message,
    });
  }
});

exports.getFilesByFolderId = async (req, res) => {
  try {
    const folderId = new mongoose.Types.ObjectId(req.params.id);

    const files = await Files.aggregate([
      { $match: { folderID: folderId } },
      {
        $lookup: {
          from: "category",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $lookup: {
          from: "admins",
          localField: "admin",
          foreignField: "_id",
          as: "adminInfo",
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "departmentInfo",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      {
        $lookup: {
          from: "officers",
          localField: "officer",
          foreignField: "_id",
          as: "officerInfo",
        },
      },
      {
        $lookup: {
          from: "sbmembers",
          localField: "author",
          foreignField: "_id",
          as: "authorInfo",
        },
      },
      {
        $lookup: {
          from: "admins",
          localField: "archivedMetadata.archivedBy",
          foreignField: "_id",
          as: "archiverInfo",
        },
      },
      { $unwind: { path: "$authorInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
      {
        $unwind: { path: "$departmentInfo", preserveNullAndEmptyArrays: true },
      },
      { $unwind: { path: "$adminInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$officerInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$archiverInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: 1,
          summary: 1,
          fullText: 1,
          fileUrl: 1,
          fileName: 1,
          status: 1,
          tags: 1,
          approverID: 1,
          Archived: 1,
          fileSize: 1,
          createdAt: 1,
          updatedAt: 1,
          "archivedMetadata.dateArchived": 1,
          "archivedMetadata.notes": 1,
          "archivedMetadata.archivedBy": 1,
          departmentID: "$departmentInfo._id",
          author: {
            $concat: [
              "$authorInfo.first_name",
              " ",
              "$authorInfo.middle_name",
              " ",
              "$authorInfo.last_name",
            ],
          },
          department: "$departmentInfo.department",
          category: "$categoryInfo.category",
          categoryID: "$categoryInfo._id",
          admin: 1,
          admin_first_name: "$adminInfo.first_name",
          admin_last_name: "$adminInfo.last_name",
          archivedBy_first_name: "$archiverInfo.first_name",
          archivedBy_last_name: "$archiverInfo.last_name",
          officer: "$officerInfo._id",
          officer_first_name: "$officerInfo.first_name",
          officer_last_name: "$officerInfo.last_name",
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: files,
    });
  } catch (error) {
    console.error("Error fetching files by folder ID:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong while fetching files",
      error: error.message,
    });
  }
};
