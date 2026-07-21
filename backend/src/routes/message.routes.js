const express = require("express");

const {
    getMessages,
    sendMessage
} = require("../controllers/message.controller");

const router = express.Router();

// Get all messages of a chat
router.get("/:chatId", getMessages);

// Send a message
router.post("/sendMessage", sendMessage);

module.exports = router;