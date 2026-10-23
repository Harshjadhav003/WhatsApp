const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware.js");


const {
    getChats,
    createChat,
    searchUsers
} = require("../controllers/chat.controller");

const router = express.Router();


router.get("/", authMiddleware, getChats);
router.post("/", authMiddleware, createChat);
router.get("/users/search", authMiddleware, searchUsers);

router.get("/test", authMiddleware, (req, res) => {
    res.json({
        message: "Protected Route"
    });
});

module.exports = router ;
