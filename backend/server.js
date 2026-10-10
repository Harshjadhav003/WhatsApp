require("dotenv").config();
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const connectDB= require("./src/database/db.js");
const app = require("./app.js");

const http = require("http");

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
    } catch (error) {
        next(new Error("Authentication error"));
    }
});
io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);
  console.log("Authenticated user:", socket.user);

  socket.join(socket.user.userId);

  console.log("Joined room:", socket.user.userId);
  console.log("Socket rooms:", [...socket.rooms]);

  socket.on("test-message", (data) => {
    io.to(socket.user.userId).emit("newMessage", data);
  });
});

const PORT = process.env.PORT || 5000 ;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(` Server running on ${PORT}`);
    });
});