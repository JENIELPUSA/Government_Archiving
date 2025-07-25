const mongoose = require("mongoose");
const LogActionAudit = require("../Models/LogActionAudit");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");

exports.displayAuditLogs = AsyncErrorHandler(async (req, res) => {
  const logs = await LogActionAudit.aggregate([
    {
      $facet: {
        officerLogs: [
          {
            $match: { performedByModel: "Officer" },
          },
          {
            $lookup: {
              from: "officers",
              localField: "performedBy",
              foreignField: "_id",
              as: "user_info",
            },
          },
          {
            $lookup: {
              from: "files",
              localField: "file",
              foreignField: "_id",
              as: "file_info",
            },
          },
          {
            $addFields: {
              file_title: {
                $let: {
                  vars: {
                    fileDoc: { $arrayElemAt: ["$file_info", 0] },
                  },
                  in: "$$fileDoc.title",
                },
              },
              performed_by_name: {
                $cond: [
                  { $gt: [{ $size: "$user_info" }, 0] },
                  {
                    $concat: [
                      {
                        $ifNull: [
                          { $arrayElemAt: ["$user_info.first_name", 0] },
                          "",
                        ],
                      },
                      " ",
                      {
                        $ifNull: [
                          { $arrayElemAt: ["$user_info.last_name", 0] },
                          "",
                        ],
                      },
                    ],
                  },
                  "Unknown",
                ],
              },
            },
          },
        ],
        adminLogs: [
          {
            $match: { performedByModel: "Admin" },
          },
          {
            $lookup: {
              from: "admins",
              localField: "performedBy",
              foreignField: "_id",
              as: "user_info",
            },
          },
          // Added lookup for 'files' for admin logs
          {
            $lookup: {
              from: "files",
              localField: "file",
              foreignField: "_id",
              as: "file_info",
            },
          },
          {
            $addFields: {
              // Now correctly retrieves file_title for admin logs if 'file' exists
              file_title: {
                $let: {
                  vars: {
                    fileDoc: { $arrayElemAt: ["$file_info", 0] },
                  },
                  in: "$$fileDoc.title",
                },
              },
              performed_by_name: {
                $cond: [
                  { $gt: [{ $size: "$user_info" }, 0] },
                  {
                    $concat: [
                      {
                        $ifNull: [
                          { $arrayElemAt: ["$user_info.first_name", 0] },
                          "",
                        ],
                      },
                      " ",
                      {
                        $ifNull: [
                          { $arrayElemAt: ["$user_info.last_name", 0] },
                          "",
                        ],
                      },
                    ],
                  },
                  "Unknown",
                ],
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        mergedLogs: {
          $concatArrays: ["$officerLogs", "$adminLogs"],
        },
      },
    },
    { $unwind: "$mergedLogs" },
    {
      $replaceRoot: {
        newRoot: "$mergedLogs",
      },
    },
    {
      $project: {
        action: 1,
        type: 1,
        file: 1,
        createdAt: 1,
        ipAddress: 1,
        userAgent: 1,
        file_title: 1,
        performed_by_name: 1,
        level: 1,
        department: 1,
        category: 1,
        beforeChange: 1,
        afterChange: 1,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    results: logs.length,
    data: logs,
  });
});
