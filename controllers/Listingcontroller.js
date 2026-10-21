const Listing = require("../models/Listing");

const {
    predictListingCategory,
    recommendListings
} = require("../backend_integration");

// CREATE LISTING
const createListing = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            listingType,
            condition,
            location
        } = req.body;

        // Validate required fields (category can be predicted by ML)
        if (
            !title ||
            !description ||
            !listingType ||
            !condition ||
            !location
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Title, description, listing type, condition and location are required"
            });
        }

        // Predict category using the ML service
        let finalCategory = category;

        try {
            const prediction = await predictListingCategory({
                title,
                description
            });

            if (prediction.predicted_category) {
                finalCategory = prediction.predicted_category;
            }
        } catch (error) {
            console.error("ML category prediction failed:", error.message);
        }

        // Fall back to the user's category if ML is unavailable
        if (!finalCategory) {
            return res.status(503).json({
                success: false,
                message:
                    "ML category prediction is unavailable. Please try again or provide a category."
            });
        }

        // Create listing using the authenticated user's ID
        const listing = await Listing.create({
            ownerId: req.user.id,
            title,
            description,
            category: finalCategory,
            listingType,
            condition,
            location
        });

        return res.status(201).json({
            success: true,
            message: "Item listed successfully",
            listing
        });
    } catch (error) {
        console.error("Create listing error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error while creating listing"
        });
    }
};

// GET ALL AVAILABLE LISTINGS
const getAllListings = async (req, res) => {
    try {
        const listings = await Listing.find({
            status: "available"
        })
            .populate("ownerId", "name campus hostel")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: listings.length,
            listings
        });
    } catch (error) {
        console.error("Get listings error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching listings"
        });
    }
};
// GET ML-POWERED RECOMMENDATIONS
const getRecommendedListings = async (req, res) => {
    try {
        const {
            query = "",
            category,
            listingType,
            location,
            limit = 5
        } = req.body;

        // Fetch only currently available listings
        const listings = await Listing.find({
            status: "available"
        }).lean();

        const result = await recommendListings({
            query,
            category,
            listingType,
            location,
            limit: Math.min(Math.max(Number(limit) || 5, 1), 20),
            listings,
            excludeListingIds: []
        });

        return res.status(200).json({
            success: true,
            recommendations: result.recommendations || result
        });
    } catch (error) {
        console.error("Get recommended listings error:", error.message);

        return res.status(502).json({
            success: false,
            message: "Unable to fetch ML recommendations"
        });
    }
};

// GET LISTING BY ID
const getListingById = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate("ownerId", "name campus hostel");

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found"
            });
        }

        return res.status(200).json({
            success: true,
            listing
        });
    } catch (error) {
        console.error("Get listing by ID error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid listing ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error while fetching listing"
        });
    }
};

// UPDATE LISTING
const updateListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found"
            });
        }

        if (listing.ownerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this listing"
            });
        }

        const allowedFields = [
            "title",
            "description",
            "category",
            "listingType",
            "condition",
            "location"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                listing.set(field, req.body[field]);
            }
        });

        await listing.save();

        return res.status(200).json({
            success: true,
            message: "Listing updated successfully",
            listing
        });
    } catch (error) {
        console.error("Update listing error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid listing ID"
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error while updating listing"
        });
    }
};

// DELETE LISTING (SOFT DELETE)
const deleteListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found"
            });
        }

        if (listing.ownerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to remove this listing"
            });
        }

        listing.status = "removed";
        await listing.save();

        return res.status(200).json({
            success: true,
            message: "Listing removed successfully"
        });
    } catch (error) {
        console.error("Delete listing error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid listing ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error while removing listing"
        });
    }
};

module.exports = {
    createListing,
    getAllListings,
    getRecommendedListings,
    getListingById,
    updateListing,
    deleteListing
};