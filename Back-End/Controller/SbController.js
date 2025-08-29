const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const SBmember = require("../Models/SBmember");
const UserLoginSchema = require("../Models/LogInDentalSchema");
const axios = require("axios");
exports.createSBmember = AsyncErrorHandler(async (req, res) => {
  const newSBmember = await SBmember.create(req.body);

  res.status(201).json({
    status: "success",
    message: "SB member created successfully.",
    data: newSBmember,
  });
});

exports.DisplaySBmember = AsyncErrorHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const { search = "", dateFrom, dateTo } = req.query;
        const matchStage = {};
        const hasDateFrom = dateFrom && dateFrom.trim() !== "";
        const hasDateTo = dateTo && dateTo.trim() !== "";

        if (hasDateFrom || hasDateTo) {
            matchStage.created_at = {};

            if (hasDateFrom) {
                matchStage.created_at.$gte = new Date(dateFrom);
            }

            if (hasDateTo) {
                const endDate = new Date(dateTo);
                endDate.setDate(endDate.getDate() + 1);
                matchStage.created_at.$lt = endDate;
            }
        }

        const pipeline = [
            {
                $addFields: {
                    full_name: {
                        $concat: [
                            { $ifNull: ["$first_name", ""] },
                            " ",
                            { $ifNull: ["$middle_name", ""] },
                            " ",
                            { $ifNull: ["$last_name", ""] },
                        ],
                    },
                },
            },
            {
                $match: {
                    ...matchStage,
                    ...(search.trim()
                        ? {
                              full_name: {
                                  $regex: new RegExp(search.trim(), "i"),
                              },
                          }
                        : {}),
                },
            },
            {
                $sort: { created_at: -1 },
            },
            {
                $project: {
                    _id: 1,
                    avatar: 1,
                    first_name: 1,
                    middle_name: 1,
                    last_name: 1,
                    detailInfo: 1,
                    term_from:1,
                    term_to:1,
                    email: 1,
                    Position: 1,
                    created_at: 1,
                    full_name: 1,
                },
            },
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{ $count: "count" }],
                },
            },
        ];

        const results = await SBmember.aggregate(pipeline);

        const data = results[0].data;
        const totalSBmember = results[0].totalCount[0]?.count || 0;

        res.status(200).json({
            status: "success",
            data,
            totalSBmember,
            currentPage: page,
            totalPages: Math.ceil(totalSBmember / limit),
        });
    } catch (error) {
        console.error("Error fetching SB members:", error);
        res.status(500).json({
            status: "fail",
            message: "Something went wrong while fetching SB members.",
            error: error.message,
        });
    }
});


exports.DisplaySBmemberInDropdown = AsyncErrorHandler(async (req, res) => {
  try {
    const { search = "" } = req.query;

    const pipeline = [
      {
        $addFields: {
          full_name: {
            $concat: [
              { $ifNull: ["$first_name", ""] },
              " ",
              { $ifNull: ["$middle_name", ""] },
              " ",
              { $ifNull: ["$last_name", ""] },
            ],
          },
        },
      },
      ...(search.trim()
        ? [
            {
              $match: {
                full_name: { $regex: new RegExp(search.trim(), "i") },
              },
            },
          ]
        : []),
      {
        $sort: { full_name: 1 },
      },
      {
        $project: {
          _id: 1,
          full_name: 1,
          Position: 1, // <-- idinagdag
        },
      },
    ];

    const members = await SBmember.aggregate(pipeline);

    res.status(200).json({
      status: "success",
      data: members,
      totalMembers: members.length,
    });
  } catch (error) {
    console.error("Error fetching all SB members:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong while fetching all SB members.",
      error: error.message,
    });
  }
});



exports.UpdateSBmember = AsyncErrorHandler(async (req, res) => {
  const SbmemberID = req.params.id;

  try {
    const oldRecord = await SBmember.findById(SbmemberID);
    if (!oldRecord) {
      return res.status(404).json({ error: "SB Member not found" });
    }

    const avatarObj = oldRecord.avatar || {};
    let newAvatarUrl = avatarObj.url || null;
    const oldAvatarUrl = avatarObj.url;

    if (req.file) {
      const form = new FormData();
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
      form.append("file", blob, req.file.originalname);

      const uploadResponse = await axios.post(
        "https://tan-kudu-520349.hostingersite.com/upload.php",
        form, {
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
      console.log("New avatar uploaded to Hostinger:", newAvatarUrl);
    }

    const updateData = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      middle_name: req.body.middle_name,
      email: req.body.email,
      Position: req.body.Position,
      detailInfo: req.body.detailInfo,
    };

    if (req.file) {
      updateData.avatar = {
        ...avatarObj,
        url: newAvatarUrl,
      };
    }

    const updatedSBmember = await SBmember.findByIdAndUpdate(
      SbmemberID,
      updateData, { new: true }
    );

    if (!updatedSBmember) {
      return res.status(404).json({ error: "SB Member not found after update" });
    }

    res.json({ status: "success", data: updatedSBmember });

    if (req.file && oldAvatarUrl) {
      const params = new URLSearchParams();
      params.append("file", oldAvatarUrl);

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
            console.log("Old avatar deleted in background:", oldAvatarUrl);
          } else {
            console.error("Failed to delete old avatar in background:", response.data.message);
          }
        })
        .catch(error => {
          console.error("Error deleting old avatar in background:", error.message);
        });
    }

  } catch (error) {
    console.error("UpdateSBmember Error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});


exports.deleteSBmember = AsyncErrorHandler(async (req, res, next) => {
  const SbmemberID = req.params.id;

  const existingSB = await SBmember.findById(SbmemberID);
  if (!existingSB) {
    return res.status(404).json({
      status: "fail",
      message: "SB member not found.",
    });
  }

  const avatarUrlToDelete = existingSB.avatar?.url;

  // Hakbang 1: Tanggalin ang linked login at ang SB member record sa database.
  const userLogin = await UserLoginSchema.findOne({ linkedId: SbmemberID });
  if (userLogin) {
    await UserLoginSchema.findByIdAndDelete(userLogin._id);
  }

  await SBmember.findByIdAndDelete(SbmemberID);

  // Hakbang 2: Magbigay ng mabilis na success response sa user.
  res.status(200).json({
    status: "success",
    message: "SB member and related login deleted successfully.",
  });

  // Hakbang 3: "Fire and Forget" - I-delete ang avatar file sa background.
  if (avatarUrlToDelete) {
    const params = new URLSearchParams();
    params.append("file", avatarUrlToDelete);

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
        console.log("✅ Avatar deleted from Hostinger in background:", avatarUrlToDelete);
      } else {
        console.error("❌ Failed to delete avatar from Hostinger in background:", response.data.message);
      }
    })
    .catch(error => {
      console.error("❌ Error deleting avatar from Hostinger in background:", error.message);
    });
  }
});




exports.getAllAuthorsWithFiles = AsyncErrorHandler(async (req, res, next) => {
  const { search } = req.query;
  const aggregationPipeline = [
    {
      $lookup: {
        from: "files",
        localField: "_id",
        foreignField: "author",
        as: "files",
      },
    },
    {
      $unwind: {
        path: "$files",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "files.category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    {
      $unwind: {
        path: "$categoryInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        fullName: {
          $concat: [
            "$first_name",
            " ",
            { $ifNull: ["$middle_name", ""] },
            " ",
            "$last_name",
          ],
        },
        "files.categoryName": "$categoryInfo.category",
      },
    },
    ...(search
      ? [
          {
            $match: {
              $or: [
                {
                  $or: [
                    { first_name: { $regex: search, $options: "i" } },
                    { middle_name: { $regex: search, $options: "i" } },
                    { last_name: { $regex: search, $options: "i" } },
                  ],
                },
                {
                  fullName: { $regex: search, $options: "i" },
                },
              ],
            },
          },
        ]
      : []),
    {
      $group: {
        _id: "$_id",
        fullName: { $first: "$fullName" },
        memberInfo: { $first: "$$ROOT" },
        files: {
          $push: {
            _id: "$files._id",
            title: "$files.title",
            summary: "$files.summary",
            category: "$categoryInfo.category",
            createdAt: "$files.createdAt",
            status: "$files.status",
            filePath: "$files.filePath",
            resolutionNo: "$files.ResolutionNo",
            dateOfResolution: "$files.dateOfResolution",
            resolutionNumber: "$files.resolutionNumber",
          },
        },
        count: {
          $sum: {
            $cond: [{ $ifNull: ["$files._id", false] }, 1, 0],
          },
        },
        resolutionCount: {
          $sum: {
            $cond: [{ $eq: ["$categoryInfo.category", "Resolution"] }, 1, 0],
          },
        },
        ordinanceCount: {
          $sum: {
            $cond: [{ $eq: ["$categoryInfo.category", "Ordinance"] }, 1, 0],
          },
        },
      },
    },
    {
      $sort: { fullName: 1 },
    },
  ];

  const AuthorsWithFiles = await SBmember.aggregate(
    aggregationPipeline
  ).allowDiskUse(true);

  const totalCount = AuthorsWithFiles.length;

  const limit = parseInt(req.query.limit) || 6;
  const currentPage = parseInt(req.query.page) || 1;
  const totalPages = Math.ceil(totalCount / limit);

  const startIndex = (currentPage - 1) * limit;
  const endIndex = currentPage * limit;
  const paginatedData = AuthorsWithFiles.slice(startIndex, endIndex);

  res.status(200).json({
    status: "success",
    currentPage,
    totalPages,
    data: paginatedData,
  });
});
