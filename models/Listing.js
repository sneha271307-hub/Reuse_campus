const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        listingType: {
            type: String,
            enum: ["lend", "donate", "exchange"],
            required: true
        },

        condition: {
            type: String,
            enum: ["new", "like-new", "good", "fair"],
            required: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: [
                "available",
                "requested",
                "borrowed",
                "completed",
                "removed"
            ],
            default: "available"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Listing", listingSchema);