const express = require("express");
const router = express.Router();

const requestController = require("../controllers/requestcontroller");
const authMiddleware = require("../middleware/authmiddleware");

router.post("/", authMiddleware, requestController.createRequest);
router.get(
    "/incoming",
    authMiddleware,
    requestController.getIncomingRequests
);
router.patch(
    "/:id/status",
    authMiddleware,
    requestController.updateRequestStatus
);
router.get("/my-requests", authMiddleware, requestController.getMyRequests);

module.exports = router;