const { io } = require("socket.io-client");

const socket = io("http://localhost:5000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWNjZTc4NWQwNDY0YzQwZDI1NmQxYTYiLCJpYXQiOjE3OTE4MTM1NzIsImV4cCI6MTc5MjQxODM3Mn0.OcZwTlOJR0TVGvODGGyuQEqkgarffhNrH8sONaWK58o",
  },
});

socket.on("connect", () => {
  console.log("Connected to server:", socket.id);


});

socket.on("newMessage", (data) => {
  console.log("Received actual chat message:", data);
});

socket.on("connect_error", (error) => {
  console.log("Connection error:", error.message);
});