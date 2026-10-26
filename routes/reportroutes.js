
const express = require("express");
const router = express.Router();

const reportController = require("../controllers/reportcontroller");
const authMiddleware = require("../middleware/authmiddleware");

// Create a new report
router.post("/", authMiddleware, reportController.createReport);

module.exports = router;

