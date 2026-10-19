const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
    {
        listingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing",
            required: true
        },

        requesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        message: {
            type: String,
            trim: true,
            maxlength: 500
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "cancelled", "completed"],
            default: "pending"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);