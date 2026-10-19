const authMiddleware = require("../middleware/authmiddleware");
const express = require("express");


const {
    registerUser,
    loginUser
} = require("../controllers/authcontroller");

const router = express.Router();

// Register student
router.post("/register", registerUser);

// Login student
router.post("/login", loginUser);
router.get("/test", authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authentication successful!",
        user: req.user
    });
});

module.exports = router;