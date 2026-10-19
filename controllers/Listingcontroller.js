const Listing = require("../models/Listing");

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

        // Validate required fields
        if (
            !title ||
            !description ||
            !category ||
            !listingType ||
            !condition ||
            !location
        ) {
            return res.status(400).json({
                success: false,
                message: "All listing fields are required"
            });
        }

        // Create listing using authenticated user's ID
        const listing = await Listing.create({
            ownerId: req.user.id,
            title,
            description,
            category,
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
        console.error("Create listing error:", error.message);

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
const updateListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found"
            });
        }

        // Only the owner can update the listing
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
const deleteListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found"
            });
        }

        // Only the owner can remove the listing
        if (listing.ownerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to remove this listing"
            });
        }

        // Soft delete: preserve the record
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
     getListingById,
      updateListing,
         deleteListing
         
};