require("dotenv").config();
const { io } = require("socket.io-client");

const socket = io("http://localhost:5000", {
  auth: {
    token: process.env.SOCKET_TEST_TOKEN
  }
});

socket.on("connect", () => {
  console.log("Connected to server:", socket.id);


});

socket.on("newMessage", (data) => {
  console.log("Received actual chat message:", data);
});

socket.on("messagesRead", (data) => {
    console.log("Read receipt received:", data);
});

socket.on("connect_error", (error) => {
  console.log("Connection error:", error.message);
});