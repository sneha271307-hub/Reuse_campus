const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const uploadController = require("../controllers/uploadcontroller");
const authMiddleware = require("../middleware/authmiddleware");

// Configure upload storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../uploads");
        const fs = require("fs");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" +
            file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");

        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// Upload a file
router.post("/", authMiddleware, upload.single("file"), uploadController.uploadFile);

module.exports = router;