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

        // Step 1: Get userId from request body
        const { userId } = req.body || {};

        // Step 2: Validate userId
if (
    typeof userId !== "string" ||
    !/^[0-9a-fA-F]{24}$/.test(userId)
) {
    return res.status(400).json({
        success: false,
        message: "Valid user ID is required"
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

        // Step 4: Prevent self-chat
        if (req.user.userId.toString() === userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot create a chat with yourself"
            });
        }

        // Step 5: Check if chat already exists
        const existingChat = await Chat.findOne({
            participants: {
                $all: [
                    req.user.userId.toString(),
                    userId.toString()
                ]
            },
            isGroupChat: false
        })
        .populate("participants", "name email");

        // Step 6: If chat already exists
        if (existingChat) {
            return res.status(200).json({
                success: true,
                message: "Chat already exists",
                chat: existingChat
            });
        }

        // Step 7: Create new chat
        const chat = await Chat.create({
            participants: [
                req.user.userId,
                userId
            ],
            isGroupChat: false
        });

        // Step 8: Populate participants
        await chat.populate("participants", "name email");

        // Step 9: Send response
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
    createChat,
    searchUsers
};