
const Report = require("../models/report");

// Create a new report
exports.createReport = async (req, res) => {
    try {
        const { targetType, targetId, reason, description } = req.body;

        if (!targetType || !targetId || !reason) {
            return res.status(400).json({
                success: false,
                message: "targetType, targetId and reason are required"
            });
        }

        if (!["listing", "user"].includes(targetType)) {
            return res.status(400).json({
                success: false,
                message: "targetType must be listing or user"
            });
        }

        const report = await Report.create({
            reporterId: req.user.id,
            targetType,
            targetId,
            reason,
            description
        });

        return res.status(201).json({
            success: true,
            message: "Report submitted successfully",
            report
        });
    } catch (error) {
        console.error("Create report error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error while creating report"
        });
    }
};

