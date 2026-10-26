const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// ============================================
// GET ALL NOTIFICATIONS FOR LOGGED-IN USER
// ============================================
const getNotifications = async (req, res) => {
    try {
        console.log("GET NOTIFICATIONS CONTROLLER HIT");
        const userId = req.user.id;

        console.log("Logged-in user ID:", userId);
        console.log("Connected database:", mongoose.connection.name);
        console.log("Collection:", Notification.collection.name);
console.log("Total documents:", await Notification.countDocuments());

console.log("Query userId:", userId, typeof userId);
console.log(
    "All notification userIds:",
    (await Notification.find({}, "userId")).map(n => ({
        userId: n.userId.toString(),
        type: typeof n.userId
    }))
);

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 });

        console.log("Notifications found:", notifications.length);

    return res.status(200).json({
        success: true,
        count: notifications.length,
        notifications
    });
} catch (error) {
    console.error("Get notifications error:", error.message);

    return res.status(500).json({
        success: false,
        message: "Server error while fetching notifications"
    });
}


};

// ============================================
// MARK ONE NOTIFICATION AS READ
// ============================================
const markAsRead = async (req, res) => {
try {
const { id } = req.params;


    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid notification ID"
        });
    }

    const notification = await Notification.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        { $set: { isRead: true } },
        { new: true, runValidators: true }
    );

    if (!notification) {
        return res.status(404).json({
            success: false,
            message: "Notification not found"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Notification marked as read",
        notification
    });
} catch (error) {
    console.error("Mark notification as read error:", error.message);

    return res.status(500).json({
        success: false,
        message: "Server error while updating notification"
    });
}


};

// ============================================
// MARK ALL USER NOTIFICATIONS AS READ
// ============================================
const markAllAsRead = async (req, res) => {
try {
const result = await Notification.updateMany(
{ userId: req.user.id, isRead: false },
{ $set: { isRead: true } }
);


    return res.status(200).json({
        success: true,
        message: "All notifications marked as read",
        modifiedCount: result.modifiedCount
    });
} catch (error) {
    console.error("Mark all notifications as read error:", error.message);

    return res.status(500).json({
        success: false,
        message: "Server error while updating notifications"
    });
}


};

module.exports = {
getNotifications,
markAsRead,
markAllAsRead
};
