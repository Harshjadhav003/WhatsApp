const express = require("express");
require("dotenv").config();

const authRoutes = require("./src/routes/auth.routes");
const chatRoutes = require("./src/routes/chat.routes");
const messageRoutes = require("./src/routes/message.routes");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Test Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "WhatsApp Backend Running "
    });
});

module.exports = app;