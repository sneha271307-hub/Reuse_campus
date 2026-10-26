const mongoose = require("mongoose");

const searchSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        query: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 100
        }
    },
    {
        timestamps: true
    }
);

searchSchema.index({ query: 1 });

module.exports = mongoose.model("Search", searchSchema);