const { io } = require("socket.io-client");

const token = process.env.SOCKET_TEST_TOKEN;

if (!token) {
    console.error("SOCKET_TEST_TOKEN environment variable is missing.");
    process.exit(1);
}

const socket = io("http://localhost:5000", {
    auth: { token },
    reconnection: false,
    timeout: 5000
});

socket.on("connect", () => {
    console.log("Recipient connected:", socket.id);
    console.log("Waiting for newMessage event...");
});

socket.on("newMessage", (message) => {
    console.log("LIVE MESSAGE RECEIVED:");
    console.log(JSON.stringify(message, null, 2));
    socket.disconnect();
    process.exit(0);
});

socket.on("connect_error", (error) => {
    console.error("Socket connection failed:", error.message);
    process.exit(1);
});

setTimeout(() => {
    console.log("Timed out: no newMessage event received.");
    socket.disconnect();
    process.exit(2);
}, 60000);
