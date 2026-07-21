const getMessages = async (req, res) => {
    res.json({
        message: "All Messages"
    });
};

const sendMessage = async (req, res) => {
    res.json({
        message: "Message Sent"
    });
};

module.exports = {
    getMessages,
    sendMessage
};