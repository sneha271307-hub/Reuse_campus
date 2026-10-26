
const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatcontroller");
const authMiddleware = require("../middleware/authmiddleware");

// Get messages for a request
router.get(
    "/:id/messages",
    authMiddleware,
    chatController.getMessages
);

// Send a message for a request
router.post(
    "/:id/messages",
    authMiddleware,
    chatController.sendMessage
);

module.exports = router;

