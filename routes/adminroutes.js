
const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admincontroller");
const authMiddleware = require("../middleware/authmiddleware");
const adminMiddleware = require("../middleware/adminmiddleware");

// Both authentication and admin authorization are required
router.get("/stats", authMiddleware, adminMiddleware, adminController.getStats);
router.get("/reports", authMiddleware, adminMiddleware, adminController.getReports);
router.patch("/reports/:id", authMiddleware, adminMiddleware, adminController.updateReportStatus);
router.patch("/listings/:id/status", authMiddleware, adminMiddleware, adminController.updateListingStatus);

module.exports = router;

