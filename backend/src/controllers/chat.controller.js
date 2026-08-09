const User = require("../models/user.model");
const Chat = require("../models/chat.model");


// Get All Chats
const getChats = async (req, res) => {
    res.json({
        message: "All Chats"
    });
};


// Create Chat
const createChat = async (req, res) => {
    try {

        // Step 1: Get userId from request body
        const { userId } = req.body;

        // Step 2: Validate userId
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Step 3: Check if target user exists
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Step 4: Check if chat already exists
        const existingChat = await Chat.findOne({
            participants: {
                $all: [
                    req.user.userId,
                    userId
                ]
            },
            isGroupChat: false
        }).populate("participants", "name email");

        // Step 5: If chat already exists
        if (existingChat) {
            return res.status(200).json({
                success: true,
                message: "Chat already exists",
                chat: existingChat
            });
        }

        // Step 6: Create new chat
        const chat = await Chat.create({
            participants: [
                req.user.userId,
                userId
            ],
            isGroupChat: false
        });

        // Step 7: Send response
        return res.status(201).json({
            success: true,
            message: "Chat created successfully",
            chat
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


module.exports = {
    getChats,
    createChat
};