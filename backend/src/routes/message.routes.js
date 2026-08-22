const express = require("express");

const {
    getMessages,
    sendMessage
} = require("../controllers/message.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/:chatId", authMiddleware, getMessages);

router.post("/sendMessage", authMiddleware, sendMessage);

module.exports = router;