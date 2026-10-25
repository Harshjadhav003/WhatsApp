const User = require("../models/user.model");
const Chat = require("../models/chat.model");

// Get All Chats
const getChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user.userId
        })
        .populate("participants", "name email")
        .populate({
            path: "latestMessage",
            populate: {
                path: "sender",
                select: "name email"
            }
        })
        .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Chats fetched successfully",
            chats
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


 // Search registered users
const searchUsers = async (req, res) => {
    try {
        const query =
            typeof req.query.search === "string"
                ? req.query.search.trim()
                : "";

 if (query.length < 2) {
    return res.status(200).json({
        success: true,
        users: []
    });
}

if (query.length > 50) {
    return res.status(400).json({
        success: false,
        message: "Search query is too long"
    });
}

const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const users = await User.find({
            _id: { $ne: req.user.userId },
            $or: [
               { name: { $regex: escapedQuery, $options: "i" } },
{ email: { $regex: escapedQuery, $options: "i" } }
            ]
        })
            .select("name email profilePic about")
            .limit(20);

        return res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error("Search users error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not search users"
        });
    }
};



// Create Chat

const createChat = async (req, res) => {
    try {
        // Step 1: Get and validate target user ID
        const { userId } = req.body || {};

        if (
            typeof userId !== "string" ||
            !/^[0-9a-fA-F]{24}$/.test(userId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid user ID is required"
            });
        }

        // Step 2: Prevent self-chat
        const currentUserId = req.user.userId.toString();

        if (currentUserId === userId.toLowerCase()) {
            return res.status(400).json({
                success: false,
                message: "You cannot create a chat with yourself"
            });
        }

        // Step 3: Check whether target user exists
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Step 4: Generate a consistent key for both user
        const directChatKey = [
            currentUserId,
            userId.toLowerCase()
        ].sort().join("_");

        // Step 5: Find an existing direct chat
        const existingChat = await Chat.findOne({
            directChatKey,
            isGroupChat: false
        }).populate("participants", "name email");

        if (existingChat) {
            return res.status(200).json({
                success: true,
                message: "Chat already exists",
                chat: existingChat
            });
        }

        // Step 6: Create the direct chat
        const chat = await Chat.create({
            participants: [currentUserId, userId],
            isGroupChat: false,
            directChatKey
        });

        // Step 7: Populate participant details
        await chat.populate("participants", "name email");

        return res.status(201).json({
            success: true,
            message: "Chat created successfully",
            chat
        });
    } catch (err) {
        // Handle concurrent requests for the same direct chat.
        if (err.code === 11000) {
            try {
                const targetUserId = req.body?.userId;

                if (
                    typeof targetUserId === "string" &&
                    /^[0-9a-fA-F]{24}$/.test(targetUserId)
                ) {
                    const directChatKey = [
                        req.user.userId.toString().toLowerCase(),
                        targetUserId.toLowerCase()
                    ].sort().join("_");

                    const existingChat = await Chat.findOne({
                        directChatKey,
                        isGroupChat: false
                    }).populate("participants", "name email");

                    if (existingChat) {
                        return res.status(200).json({
                            success: true,
                            message: "Chat already exists",
                            chat: existingChat
                        });
                    }
                }
            } catch (lookupError) {
                console.error(
                    "Duplicate chat lookup error:",
                    lookupError.message
                );
            }
        }
     console.error("Create chat error:", err.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


module.exports = {
    getChats,
    createChat,
    searchUsers
};
