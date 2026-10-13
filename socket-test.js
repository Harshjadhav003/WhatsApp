const { io } = require("socket.io-client");

const socket = io("http://localhost:5000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWNjZTg2Y2QwNDY0YzQwZDI1NmQxYTciLCJpYXQiOjE3OTE5MDk1MDAsImV4cCI6MTc5MjUxNDMwMH0.dXyvmAvLIhh25qqsixry0E7I0ciuhkocJShRRT9VYac",
  },
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