const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Folder = require("./../Models/FolderSchema");
const Files = require("./../Models/File");
const mongoose = require("mongoose");

exports.deleteFolder = AsyncErrorHandler(async (req, res, next) => {
  const folderId = req.params.id;

  // Check kung existing ang folder
  const FolderDoc = await Folder.findById(folderId);
  if (!FolderDoc) {
    return res.status(404).json({
      status: "fail",
      message: "Folder not found.",
    });
  }

  // 🔎 Check kung may Files na naka-link sa folder na ito
  const linkedFiles = await Files.findOne({ folderID: folderId });

  if (linkedFiles) {
    return res.status(400).json({
      status: "fail",
      message: "Folder cannot be deleted because it has linked files.",
    });
  }

  // Walang naka-link → pwede i-delete
  await Folder.findByIdAndDelete(folderId);

  res.status(200).json({
    status: "success",
    message: "Folder deleted successfully.",
  });
});

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
    const { search, page, limit } = req.query;

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 12;
    const skip = (pageNumber - 1) * limitNumber;

    const filter = {};
    if (search) {
      const cleanSearch = search.trim();
      filter.folderName = { $regex: cleanSearch, $options: "i" };
    }

    const totalCount = await Folder.countDocuments(filter);

    const Folders = await Folder.find(filter)
      .skip(skip)
      .limit(limitNumber)
      .sort({ folderName: 1 }); // Dito rin ang pagbabago

    const totalPages = Math.ceil(totalCount / limitNumber);

    res.status(200).json({
      status: "success",
      currentPage: pageNumber,
      totalPages,
      totalCount,
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

exports.getFilesByFolderId = async (req, res) => {
    try {
        const folderId = new mongoose.Types.ObjectId(req.params.id);
        const { search, page = 1, limit = 5, tags, dateFrom, dateTo } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const searchFilter = search
            ? {
                  $or: [
                      { title: { $regex: search, $options: "i" } },
                      { fileName: { $regex: search, $options: "i" } },
                      { summary: { $regex: search, $options: "i" } },
                  ],
              }
            : {};

        // ---- Tags filter ----
        let tagsFilter = {};
        if (tags) {
            const tagsArray = tags.split(",").map((tag) => tag.trim());
            tagsFilter = { tags: { $in: tagsArray } };
        }
        let dateFilter = {};
        if (dateFrom || dateTo) {
            dateFilter.createdAt = {};
            if (dateFrom) {
                dateFilter.createdAt.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                const endDate = new Date(dateTo);
                endDate.setDate(endDate.getDate() + 1); // include full day
                dateFilter.createdAt.$lt = endDate;
            }
        }

        // ---- Build pipeline ----
        const pipeline = [
            {
                $match: {
                    folderID: folderId,
                    $or: [
                        { ArchivedStatus: { $exists: false } }, // kung walang field, ok lang
                        {
                            ArchivedStatus: {
                                $nin: [
                                    "Deleted",
                                    "For Restore",
                                    "deleted",
                                    "for restore",
                                    "FOR RESTORE",
                                ],
                            },
                        },
                    ],
                    ...searchFilter,
                    ...tagsFilter,
                    ...dateFilter,
                },
            },

            // ---- LOOKUPS ----
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

            // ---- UNWIND ----
            { $unwind: { path: "$authorInfo", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$departmentInfo", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$adminInfo", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$officerInfo", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$archiverInfo", preserveNullAndEmptyArrays: true } },

            // ---- PROJECT ----
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
                    ArchivedStatus: 1,
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
        ];

        // ---- Count total ----
        const totalCountPipeline = [...pipeline, { $count: "total" }];
        const totalResult = await Files.aggregate(totalCountPipeline);
        const totalCount = totalResult[0]?.total || 0;

        // ---- Pagination ----
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limitNumber });

        const files = await Files.aggregate(pipeline);

        res.status(200).json({
            status: "success",
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
            totalCount,
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




