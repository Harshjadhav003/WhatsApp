const { io } = require("socket.io-client");

const socket = io("http://localhost:5000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTY2MmU5ODE0YTNlMGZjMjY3ZTU1ODEiLCJpYXQiOjE3OTE2MDIwMjQsImV4cCI6MTc5MjIwNjgyNH0.rWxx6Xmrn8h6xU5kP3tBF90HQl3RJuSZ0MXOiiWDTKs",
  },
});

socket.on("connect", () => {
  console.log("Connected to server:", socket.id);

  socket.emit("test-message", {
    text: "Hello from Socket.IO!",
  });
});

socket.on("newMessage", (data) => {
  console.log("Received new message:", data);
});

socket.on("connect_error", (error) => {
  console.log("Connection error:", error.message);
});