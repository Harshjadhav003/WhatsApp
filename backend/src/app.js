const express = require("express");

const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");
const messageRoutes = require("./routes/message.routes");

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
        message: "WhatsApp Backend Running 🚀"
    });
});

module.exports = app;