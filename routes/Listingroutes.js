const express = require("express");
const router = express.Router();

const listingController = require("../controllers/Listingcontroller");
const authMiddleware = require("../middleware/authmiddleware");

// Get all available listings
router.get("/", listingController.getAllListings);
router.post(
    "/recommendations",
    listingController.getRecommendedListings
);
router.get("/:id", listingController.getListingById);
router.put("/:id", authMiddleware, listingController.updateListing);
// Create a new listing (login required)
router.post("/", authMiddleware, listingController.createListing);

module.exports = router;