const fs = require("fs");
const path = require("path");

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a file to upload"
            });
        }

        return res.status(201).json({
            success: true,
            message: "File uploaded successfully",
            file: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                path: req.file.path
            }
        });
    } catch (error) {
        console.error("Upload error:", error);

        return res.status(500).json({
            success: false,
            message: "File upload failed"
        });
    }
};