
const express = require("express");
const router = express.Router();

const mlController = require("../controllers/mlcontroller");
const authMiddleware = require("../middleware/authmiddleware");

// Predict a listing category
router.post(
    "/predict-category",
    authMiddleware,
    mlController.predictCategory
);

// Get recommendations
router.get(
    "/recommendations",
    authMiddleware,
    mlController.getRecommendations
);

module.exports = router;

