
const Listing = require("../models/Listing");

// Predict a listing category using keyword rules
exports.predictCategory = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (
            (!title || typeof title !== "string") &&
            (!description || typeof description !== "string")
        ) {
            return res.status(400).json({
                success: false,
                message: "Provide a title or description"
            });
        }

        const text = `${title || ""} ${description || ""}`.toLowerCase();

        const categories = [
            {
                category: "Books",
                keywords: ["book", "textbook", "novel", "notes"]
            },
            {
                category: "Electronics",
                keywords: ["laptop", "phone", "calculator", "charger", "headphone"]
            },
            {
                category: "Stationery",
                keywords: ["pen", "pencil", "notebook", "marker", "paper"]
            },
            {
                category: "Clothing",
                keywords: ["shirt", "jacket", "jeans", "clothes", "uniform"]
            },
            {
                category: "Sports",
                keywords: ["cricket", "football", "badminton", "racket", "ball"]
            }
        ];

        let predictedCategory = "Other";
        let highestScore = 0;

        for (const item of categories) {
            const score = item.keywords.filter(keyword =>
                text.includes(keyword)
            ).length;

            if (score > highestScore) {
                highestScore = score;
                predictedCategory = item.category;
            }
        }

        return res.status(200).json({
            success: true,
            input: { title: title || "", description: description || "" },
            predictedCategory,
            method: "keyword-based baseline"
        });
    } catch (error) {
        console.error("Category prediction error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to predict category"
        });
    }
};

// Get recommendations based on the student's recent searches
exports.getRecommendations = async (req, res) => {
    try {
        const Search = require("../models/Search");

        const recentSearches = await Search.find({
            userId: req.user.id
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("query");

        const keywords = recentSearches.map(item => item.query);

        let listings = [];

        if (keywords.length > 0) {
            const conditions = keywords.map(query => ({
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },
                    { category: { $regex: query, $options: "i" } }
                ]
            }));

            listings = await Listing.find({
                $or: conditions
            }).limit(10);
        }

        if (listings.length === 0) {
            listings = await Listing.find()
                .sort({ createdAt: -1 })
                .limit(10);
        }

        return res.status(200).json({
            success: true,
            count: listings.length,
            recommendations: listings
        });
    } catch (error) {
        console.error("Recommendations error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch recommendations"
        });
    }
};

