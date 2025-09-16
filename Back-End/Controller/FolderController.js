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
    const {
      search,
      page = 1,
      limit,
      tags,
      dateFrom,
      dateTo,
      categoryId,
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // ---- Search filter ----
    const searchFilter = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { fileName: { $regex: search, $options: "i" } },
            { summary: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // ---- Tags filter (support comma-separated or array, match ANY tag) ----
    let tagsFilter = {};
    if (tags) {
      let tagsArray = [];
      if (Array.isArray(tags)) {
        tagsArray = tags.map((t) => t.trim()).filter(Boolean);
      } else if (typeof tags === "string") {
        tagsArray = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }

      if (tagsArray.length > 0) {
        tagsFilter = { tags: { $in: tagsArray } }; // <-- match ANY tag
      }
    }

    // ---- Date filter ----
    let dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1); // include full day
        dateFilter.createdAt.$lt = endDate;
      }
    }

    // ---- Category filter ----
    let categoryFilter = {};
    if (categoryId) {
      try {
        categoryFilter.category = new mongoose.Types.ObjectId(categoryId);
      } catch {
        return res
          .status(400)
          .json({ status: "fail", message: "Invalid categoryId format" });
      }
    }

    // ---- Build aggregation pipeline ----
    const pipeline = [
      {
        $match: {
          folderID: folderId,
          $or: [
            { ArchivedStatus: { $exists: false } },
            {
              ArchivedStatus: {
                $nin: [
                  "Deleted",
                  "deleted",
                  "For Restore",
                  "for restore",
                  "FOR RESTORE",
                ],
              },
            },
          ],
          ...searchFilter,
          ...tagsFilter,
          ...dateFilter,
          ...categoryFilter,
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
          from: "sbmembers",
          localField: "author",
          foreignField: "_id",
          as: "authorInfo",
        },
      },
      { $unwind: { path: "$authorInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: 1,
          summary: 1,
          fileName: 1,
          fileUrl: 1,
          status: 1,
          tags: 1,
          dateOfResolution: 1,
          fileSize: 1,
          createdAt: 1,
          updatedAt: 1,
          category: "$categoryInfo.category",
          categoryID: "$categoryInfo._id",
          author: {
            $concat: [
              "$authorInfo.first_name",
              " ",
              "$authorInfo.middle_name",
              " ",
              "$authorInfo.last_name",
            ],
          },
        },
      },
      { $sort: { createdAt: -1 } },
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
    console.error("Error fetching files by folder/category ID:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong while fetching files",
      error: error.message,
    });
  }
};

exports.getUploadedCategoriesByFolderId = async (req, res) => {
  try {
    const folderId = new mongoose.Types.ObjectId(req.params.id);
    const { tags, dateFrom, dateTo, page = 1, limit = 12 } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

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

    const pipeline = [
      {
        $match: {
          folderID: folderId,
          $or: [
            { ArchivedStatus: { $exists: false } },
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
          ...tagsFilter,
          ...dateFilter,
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
      { $unwind: "$categoryInfo" },
      {
        $group: {
          _id: "$categoryInfo._id",
          category: { $first: "$categoryInfo.category" },
          totalFiles: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          categoryID: "$_id",
          category: 1,
          totalFiles: 1,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limitNumber }],
        },
      },
    ];

    const result = await Files.aggregate(pipeline);
    const categories = result[0].data;
    const total = result[0].metadata[0]?.total || 0;
    const totalPages = Math.ceil(total / limitNumber);

    res.status(200).json({
      status: "success",
      page: pageNumber,
      totalPages,
      totalCategories: total,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching uploaded categories:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong while fetching categories",
      error: error.message,
    });
  }
};

exports.getUniqueTagsByFolderId = async (req, res) => {
  try {
    const folderId = new mongoose.Types.ObjectId(req.params.id);
    const { categoryId } = req.query;

    // Build match object
    const match = {
      folderID: folderId,
      $or: [
        { ArchivedStatus: { $exists: false } },
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
    };

    // Optional category filter
    if (categoryId) {
      match.category = new mongoose.Types.ObjectId(categoryId);
    }

    const pipeline = [
      { $match: match },
      { $unwind: "$tags" },
      {
        $group: {
          _id: { $toLower: "$tags" },
          name: { $first: "$tags" },
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
        },
      },
      { $sort: { name: 1 } },
    ];

    const uniqueTags = await Files.aggregate(pipeline);

    res.status(200).json({
      status: "success",
      totalCount: uniqueTags.length,
      data: uniqueTags,
    });
  } catch (error) {
    console.error("Error fetching unique tags:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong while fetching unique tags",
      error: error.message,
    });
  }
};
