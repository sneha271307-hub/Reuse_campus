
const express = require("express");
const router = express.Router();

const searchController = require("../controllers/searchcontroller");
const authMiddleware = require("../middleware/authmiddleware");

// Save a search query
router.post("/", authMiddleware, searchController.saveSearch);

// Get trending searches
router.get("/trending", authMiddleware, searchController.getTrending);

module.exports = router;

