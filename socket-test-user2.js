require("dotenv").config({
  path: require("path").join(__dirname, ".env.test")
});

const { io } = require("socket.io-client");

console.log(
  "User 2 token loaded:",
  Boolean(process.env.SOCKET_TEST_TOKEN)
);

const socket = io("http://localhost:5000", {
  auth: {
    token: process.env.SOCKET_TEST_TOKEN
  }
});