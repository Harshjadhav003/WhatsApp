const Chat = require("../models/chat.model");
const Message = require("../models/message.model");

// Fetch all messages for a chat
const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;

        // Validate chat ID
        if (!chatId || !/^[0-9a-fA-F]{24}$/.test(chatId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chat ID"
            });
        }

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        // Verify chat participation
        const isParticipant = chat.participants.some(
            participant =>
                participant.toString() === req.user.userId
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant of this chat"
            });
        }

        const messages = await Message.find({
            chat: chatId
        })
            .sort({ createdAt: 1 })
            .populate("sender", "name email");

        return res.status(200).json({
            success: true,
            message: "Messages fetched successfully",
            messages
        });

    } catch (error) {
        console.error("Get messages error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// Send a message and notify the recipient through Socket.IO
const sendMessage = async (req, res) => {
    try {
        const { chatId, content } = req.body;

        // Validate chat ID before querying MongoDB
        if (!chatId || typeof chatId !== "string" ||
            !/^[0-9a-fA-F]{24}$/.test(chatId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chat ID"
            });
        }

        // Validate message content
        if (
            typeof content !== "string" ||
            !content.trim() ||
            content.trim().length > 5000
        ) {
            return res.status(400).json({
                success: false,
                message: "Content must be a non-empty string with at most 5000 characters"
            });
        }

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        // Only chat participants can send messages
        const isParticipant = chat.participants.some(
            participant =>
                participant.toString() === req.user.userId
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant of this chat"
            });
        }

        const message = await Message.create({
            sender: req.user.userId,
            chat: chatId,
            content: content.trim()
        });

        // Update the latest message for this chat
        chat.latestMessage = message._id;
        await chat.save();

        // Notify the other participant in real time
        const io = req.app.get("io");

        const recipientId = chat.participants.find(
            participant =>
                participant.toString() !== req.user.userId
        );

        if (io && recipientId) {
            const populatedMessage = await Message.findById(message._id)
                .populate("sender", "name email");

            io.to(recipientId.toString()).emit(
                "newMessage",
                populatedMessage
            );
        }

        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: message
        });

    } catch (error) {
        console.error("Send message error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// Mark incoming messages as read
const markMessagesAsRead = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.userId;

        // Validate chat ID before querying MongoDB
        if (!chatId || !/^[0-9a-fA-F]{24}$/.test(chatId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chat ID"
            });
        }

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        // Only chat participants can mark messages as read
        const isParticipant = chat.participants.some(
            participant =>
                participant.toString() === userId
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant of this chat"
            });
        }

        // Find messages sent by others that this user has not read
        const unreadMessages = await Message.find({
            chat: chatId,
            sender: { $ne: userId },
            readBy: { $ne: userId }
        }).select("_id");

        if (unreadMessages.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No unread messages",
                modifiedCount: 0
            });
        }

        const messageIds = unreadMessages.map(
            message => message._id
        );

        await Message.updateMany(
            {
                _id: { $in: messageIds }
            },
            {
                $addToSet: { readBy: userId }
            }
        );

        // Notify the other participants about the read receipt
        const io = req.app.get("io");

        if (io) {
            const otherParticipants = chat.participants.filter(
                participant =>
                    participant.toString() !== userId
            );

            otherParticipants.forEach(participant => {
                io.to(participant.toString()).emit("messagesRead", {
                    chatId,
                    readBy: userId,
                    messageIds
                });
            });
        }

        return res.status(200).json({
            success: true,
            message: "Messages marked as read",
            modifiedCount: unreadMessages.length
        });

    } catch (error) {
        console.error("Mark messages as read error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


module.exports = {
    getMessages,
    sendMessage,
    markMessagesAsRead
};