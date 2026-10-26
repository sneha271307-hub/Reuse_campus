
const Report = require("../models/report");
const Listing = require("../models/Listing");
const User = require("../models/user");

// Get admin dashboard statistics
exports.getStats = async (req, res) => {
    try {
        const [totalUsers, totalListings, totalReports] = await Promise.all([
            User.countDocuments(),
            Listing.countDocuments(),
            Report.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalListings,
                totalReports
            }
        });
    } catch (error) {
        console.error("Admin stats error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch admin statistics"
        });
    }
};

// Get all reports
exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate("reporterId", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: reports.length,
            reports
        });
    } catch (error) {
        console.error("Admin reports error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch reports"
        });
    }
};

// Update report status
exports.updateReportStatus = async (req, res) => {
    try {
        const { status } = req.body;
       const allowedStatuses = [
    "available",
    "requested",
    "borrowed",
    "completed",
    "removed"
];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report status"
            });
        }

        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Report status updated",
            report
        });
    } catch (error) {
        console.error("Update report status error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to update report status"
        });
    }
};

// Update listing status
exports.updateListingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatuses = ["active", "hidden", "removed"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid listing status"
            });
        }

        const listing = await Listing.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Listing status updated",
            listing
        });
    } catch (error) {
        console.error("Update listing status error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to update listing status"
        });
    }
};

