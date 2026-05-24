import Suggestion from "../Models/SuggestionSchema.js";
import user from "../Models/LogInDentalSchema.js";
import mongoose from "mongoose";
import Notification from "../Models/NotificationSchema.js";

export const createSuggestion = async (req, res) => {
    try {
        const { suggestion } = req.body;
        console.log("🔥 CREATE SUGGESTION HIT");
        console.log("Suggestion", suggestion)

        const email = suggestion?.email;
        const message = suggestion?.message;

        if (!email || !message) {
            return res.status(400).json({
                message: "Email and message are required",
            });
        }

        const admins = await user.find({ role: "admin" });

        if (!admins.length) {
            return res.status(404).json({
                message: "No admin found",
            });
        }

        const viewers = admins.map((admin) => ({
            user: admin._id,
            isRead: false,
        }));

        // ✅ ONE notification document only
        const notification = await Notification.create({
            message: `New suggestion received from ${email}`,
            viewers,
        });

        const newSuggestion = await Suggestion.create({
            adminId: admins.map(a => a._id),
            email,
            suggestion: message,
        });

        return res.status(201).json({
            message: "Suggestion created successfully",
            data: newSuggestion,
            notification,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error creating suggestion",
            error: error.message,
        });
    }
};

export const getAllSuggestions = async (req, res) => {
    try {
        const userId = req.user.linkId;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { search = "", dateFrom, dateTo } = req.query;

        const matchStage = {
            adminId: new mongoose.Types.ObjectId(userId),
        };

        const hasDateFrom = dateFrom && dateFrom.trim() !== "";
        const hasDateTo = dateTo && dateTo.trim() !== "";

        if (hasDateFrom || hasDateTo) {
            matchStage.createdAt = {};

            if (hasDateFrom) {
                matchStage.createdAt.$gte = new Date(dateFrom);
            }

            if (hasDateTo) {
                const endDate = new Date(dateTo);
                endDate.setDate(endDate.getDate() + 1);
                matchStage.createdAt.$lt = endDate;
            }
        }

        const pipeline = [
            {
                $lookup: {
                    from: "userloginschemas",
                    localField: "adminId",
                    foreignField: "_id",
                    as: "admin",
                },
            },
            {
                $addFields: {
                    adminEmail: {
                        $arrayElemAt: ["$admin.username", 0],
                    },
                },
            },
            {
                $match: {
                    ...matchStage,
                    ...(search.trim()
                        ? {
                            $or: [
                                {
                                    email: {
                                        $regex: new RegExp(search.trim(), "i"),
                                    },
                                },
                                {
                                    suggestion: {
                                        $regex: new RegExp(search.trim(), "i"),
                                    },
                                },
                                {
                                    adminEmail: {
                                        $regex: new RegExp(search.trim(), "i"),
                                    },
                                },
                            ],
                        }
                        : {}),
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $project: {
                    _id: 1,
                    email: 1,
                    suggestion: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    adminEmail: 1,
                },
            },
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{ $count: "count" }],
                },
            },
        ];

        const results = await Suggestion.aggregate(pipeline);

        const data = results[0].data;
        const totalSuggestions = results[0].totalCount[0]?.count || 0;

        res.status(200).json({
            status: "success",
            data,
            totalSuggestions,
            currentPage: page,
            totalPages: Math.ceil(totalSuggestions / limit),
        });

    } catch (error) {
        console.error("Error fetching suggestions:", error);

        res.status(500).json({
            status: "fail",
            message: "Something went wrong while fetching suggestions.",
            error: error.message,
        });
    }
};
// GET BY ID (LOOKUP)
export const getSuggestionById = async (req, res) => {
    try {
        const { id } = req.params;

        const suggestion = await Suggestion.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                },
            },
            {
                $lookup: {
                    from: "userloginschemas",
                    localField: "adminId",
                    foreignField: "_id",
                    as: "admin",
                },
            },
            {
                $unwind: {
                    path: "$admin",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    email: 1,
                    suggestion: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    adminEmail: "$admin.email",
                },
            },
        ]);

        if (!suggestion.length) {
            return res.status(404).json({
                message: "Suggestion not found",
            });
        }

        return res.status(200).json({
            message: "Suggestion fetched successfully",
            data: suggestion[0],
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching suggestion",
            error: error.message,
        });
    }
};

// UPDATE
export const updateSuggestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, message } = req.body;

        const updated = await Suggestion.findByIdAndUpdate(
            id,
            { email, suggestion: message },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({
                message: "Suggestion not found",
            });
        }

        return res.status(200).json({
            message: "Suggestion updated successfully",
            data: updated,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error updating suggestion",
            error: error.message,
        });
    }
};

// DELETE
export const deleteSuggestion = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Suggestion.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                message: "Suggestion not found",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Suggestion deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error deleting suggestion",
            error: error.message,
        });
    }
};