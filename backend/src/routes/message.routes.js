const express = require("express");

const {
    getMessages,
    sendMessage,
    markMessagesAsRead
} = require("../controllers/message.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/:chatId", authMiddleware, getMessages);

router.post("/sendMessage", authMiddleware, sendMessage);

router.patch("/:chatId/read", authMiddleware, markMessagesAsRead);

module.exports = router;