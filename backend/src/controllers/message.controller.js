const Chat = require("../models/chat.model");
const Message = require("../models/message.model")

const getMessages = async (req, res) => {

    const {chatId} = req.params;

    const chat = await Chat.findById(chatId);

    if(!chat){
        return res.status(404).json({
            success:false ,
            message:"Chat not found"
        });
    }

    const isParticipant = chat.participants.some(
    participant => participant.toString() === req.user.userId
);

       if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant of this chat"
            });
        }

const messages = await Message.find({
    chat: chatId
}).populate("sender", "name email");



  return res.status(200).json({
    success: true,
    message: "Messages fetched successfully",
    messages
});
};


const sendMessage = async (req, res) => {
    try {
        const { chatId, content } = req.body;

        if (!chatId || !content) {
            return res.status(400).json({
                success: false,
                message: "Chat ID and Content are required"
            });
        }

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        const isParticipant = chat.participants.some(
            participant => participant.toString() === req.user.userId
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
            content: content
        });

        chat.latestMessage = message._id;
        await chat.save();


const io = req.app.get("io");

console.log(
    "Chat participants:",
    chat.participants.map(id => id.toString())
);

const recipientId = chat.participants.find(
    participant => participant.toString() !== req.user.userId
);

console.log("Sender ID:", req.user.userId);
console.log("Recipient ID:", recipientId?.toString());

if (io && recipientId) {
    const populatedMessage = await Message.findById(message._id)
        .populate("sender", "name email");

    io.to(recipientId.toString()).emit("newMessage", populatedMessage);
}


        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: message
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    getMessages,
    sendMessage
};