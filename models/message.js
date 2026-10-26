
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Request",
            required: true,
            index: true
        },

        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Message", messageSchema);
