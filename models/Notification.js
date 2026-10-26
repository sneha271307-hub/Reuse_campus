const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
{
userId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
index: true
},
title: {
type: String,
required: true,
trim: true,
maxlength: 100
},
message: {
type: String,
required: true,
trim: true,
maxlength: 500
},
type: {
type: String,
enum: ["request", "message", "listing", "system"],
default: "system"
},
isRead: {
type: Boolean,
default: false
}
},
{ timestamps: true }
);
console.log("Notification collection:", mongoose.model("Notification", notificationSchema).collection.name);

module.exports = mongoose.model("Notification", notificationSchema);
