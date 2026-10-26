const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notificationcontroller");
const authMiddleware = require("../middleware/authmiddleware");

// Get all notifications for the logged-in user
router.get("/", authMiddleware, notificationController.getNotifications);

// Mark one notification as read
router.patch("/:id/read", authMiddleware, notificationController.markAsRead);

// Mark all notifications as read
router.patch("/read-all", authMiddleware, notificationController.markAllAsRead);

module.exports = router;
