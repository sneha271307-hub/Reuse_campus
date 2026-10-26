
const Search = require("../models/search");

// Save a search query
exports.saveSearch = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || typeof query !== "string" || !query.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const cleanedQuery = query.trim().toLowerCase();

        if (cleanedQuery.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Search query cannot exceed 100 characters"
            });
        }

        const search = await Search.create({
            userId: req.user.id,
            query: cleanedQuery
        });

        return res.status(201).json({
            success: true,
            message: "Search saved successfully",
            search
        });
    } catch (error) {
        console.error("Save search error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to save search"
        });
    }
};

// Get trending search queries
exports.getTrending = async (req, res) => {
    try {
        const trending = await Search.aggregate([
            {
                $group: {
                    _id: "$query",
                    searchCount: { $sum: 1 }
                }
            },
            {
                $sort: {
                    searchCount: -1,
                    _id: 1
                }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    _id: 0,
                    query: "$_id",
                    searchCount: 1
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            count: trending.length,
            trending
        });
    } catch (error) {
        console.error("Get trending error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch trending searches"
        });
    }
};

