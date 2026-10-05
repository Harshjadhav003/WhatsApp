const { io } = require("socket.io-client");

const socket = io("http://localhost:5000", {
    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTY2MmU5ODE0YTNlMGZjMjY3ZTU1ODEiLCJpYXQiOjE3OTA4NjE1NzIsImV4cCI6MTc5MTQ2NjM3Mn0.ROI1qaRMkpuCV6LZzbQVHDXgPk_C04UxI5wXkENMvqk"
    }
});

socket.on("connect", () => {
    console.log("Connected to server:", socket.id);
});