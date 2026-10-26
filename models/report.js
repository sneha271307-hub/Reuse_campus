
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        reporterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        targetType: {
            type: String,
            enum: ["listing", "user"],
            required: true
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        reason: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        description: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "resolved", "rejected"],
            default: "pending"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);

