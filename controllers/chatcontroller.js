
const mongoose = require("mongoose");
const Message = require("../models/Message");
const Request = require("../models/request");

// ============================================
// GET MESSAGES FOR A REQUEST
// ============================================
const getMessages = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request ID"
            });
        }

        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        const userId = String(req.user.id);

console.log("Logged-in user ID:", userId);
console.log("Request requester ID:", request.requesterId.toString());
console.log("Request owner ID:", request.ownerId.toString());

const isParticipant =
    request.requesterId.toString() === userId ||
    request.ownerId.toString() === userId;

console.log("Is participant:", isParticipant);
        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view these messages"
            });
        }

        const messages = await Message.find({
            requestId: id
        })
            .populate("senderId", "name")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: messages.length,
            messages
        });

    } catch (error) {
        console.error("Get messages error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching messages"
        });
    }
};


// ============================================
// SEND A MESSAGE
// ============================================
const sendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request ID"
            });
        }

        if (typeof text !== "string" || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message text is required"
            });
        }

        if (text.trim().length > 2000) {
            return res.status(400).json({
                success: false,
                message: "Message cannot exceed 2000 characters"
            });
        }

        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        const userId = req.user.id;

        const isParticipant =
            request.requesterId.toString() === userId ||
            request.ownerId.toString() === userId;

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to send messages in this conversation"
            });
        }

        const message = await Message.create({
            requestId: request._id,
            senderId: userId,
            text: text.trim()
        });

        const populatedMessage = await Message.findById(message._id)
            .populate("senderId", "name");

        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: populatedMessage
        });

    } catch (error) {
        console.error("Send message error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Server error while sending message"
        });
    }
};


module.exports = {
    getMessages,
    sendMessage
};

