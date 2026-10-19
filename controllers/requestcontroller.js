const Request = require("../models/request");
const Listing = require("../models/Listing");

// ============================================
// CREATE REQUEST + NOTIFY LISTING OWNER
// ============================================
const createRequest = async (req, res) => {
    try {
        const { listingId, message } = req.body;

        if (!listingId) {
            return res.status(400).json({
                success: false,
                message: "Listing ID is required"
            });
        }

        if (!/^[0-9a-fA-F]{24}$/.test(listingId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid listing ID"
            });
        }

        const listing = await Listing.findById(listingId);

        if (!listing || listing.status !== "available") {
            return res.status(404).json({
                success: false,
                message: "Listing is not available"
            });
        }

        if (listing.ownerId.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot request your own listing"
            });
        }

        const existingRequest = await Request.findOne({
            listingId,
            requesterId: req.user.id,
            status: { $in: ["pending", "approved"] }
        });

        if (existingRequest) {
            return res.status(409).json({
                success: false,
                message: "You already have an active request for this listing"
            });
        }

        const newRequest = await Request.create({
            listingId,
            requesterId: req.user.id,
            ownerId: listing.ownerId,
            message,
            status: "pending"
        });

        // Notify the listing owner in real time
        const io = req.app.get("io");

        if (io) {
            io.to(String(listing.ownerId)).emit("newRequest", {
                message: "Someone has requested your item!",
                request: newRequest
            });
        }

        return res.status(201).json({
            success: true,
            message: "Item requested successfully",
            request: newRequest
        });

    } catch (error) {
        console.error("Create request error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Server error while creating request"
        });
    }
};


// ============================================
// GET MY REQUESTS
// ============================================
const getMyRequests = async (req, res) => {
    try {
        const requests = await Request.find({
            requesterId: req.user.id
        })
            .populate("listingId")
            .populate("ownerId", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error("Get my requests error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching requests"
        });
    }
};


// ============================================
// GET INCOMING REQUESTS
// ============================================
const getIncomingRequests = async (req, res) => {
    try {
        const requests = await Request.find({
            ownerId: req.user.id
        })
            .populate("listingId", "title category listingType")
            .populate("requesterId", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error("Get incoming requests error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching incoming requests"
        });
    }
};


// ============================================
// UPDATE REQUEST STATUS + NOTIFY REQUESTER
// ============================================
const updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be approved or rejected"
            });
        }

        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        // Only the listing owner can approve or reject
        if (request.ownerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this request"
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending requests can be updated"
            });
        }

        // If the request is approved, mark the listing as unavailable
if (status === "approved") {
    const listing = await Listing.findById(request.listingId);

    if (!listing || listing.status !== "available") {
        return res.status(400).json({
            success: false,
            message: "Listing is no longer available"
        });
    }

    listing.status = "removed";
    await listing.save();
}

request.status = status;
await request.save();

        // Notify the requester in real time
        const io = req.app.get("io");

        if (io) {
            io.to(String(request.requesterId)).emit("requestStatusUpdated", {
                message: `Your request has been ${status}.`,
                requestId: request._id,
                status: request.status
            });
        }

        return res.status(200).json({
            success: true,
            message: `Request ${status} successfully`,
            request
        });

    } catch (error) {
        console.error("Update request status error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid request ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error while updating request"
        });
    }
};


// ============================================
// EXPORT CONTROLLERS
// ============================================
module.exports = {
    createRequest,
    getMyRequests,
    getIncomingRequests,
    updateRequestStatus
};