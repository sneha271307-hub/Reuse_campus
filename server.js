require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authroutes");
const authMiddleware = require("./middleware/authmiddleware");
const listingRoutes = require("./routes/listingroutes");
const requestRoutes = require("./routes/requestroutes");

const app = express();
const server = http.createServer(app);

// Socket.IO configuration
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
});

app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/listings", listingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);

// Home route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to ReUse Campus Backend!"
    });
});

// Authentication test route
app.get("/api/auth/test", authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authentication successful!",
        user: req.user
    });
});

// Socket.IO JWT authentication
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(new Error("Authentication token required"));
    }

    const jwt = require("jsonwebtoken");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        socket.user = decoded;

        next();
    } catch (error) {
        next(new Error("Invalid or expired authentication token"));
    }
});

// Socket.IO connection handler
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    const userId = socket.user.id || socket.user._id;

    if (!userId) {
        console.error("User ID missing from authentication token");
        socket.disconnect();
        return;
    }

    socket.join(String(userId));

    console.log(`User ${userId} joined their personal room`);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Start server after connecting to MongoDB
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();