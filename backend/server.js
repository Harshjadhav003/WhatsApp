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

app.set("io", io);

const onlineUsers = new Map();


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
  const userId = socket.user.userId;

  console.log("New socket connected:", socket.id);
  console.log("Authenticated user:", userId);

  // Join the user's personal room
  socket.join(userId);

  // Get existing sockets for this user
  let userSockets = onlineUsers.get(userId);

  if (!userSockets) {
    userSockets = new Set();
    onlineUsers.set(userId, userSockets);
  }

  // Track this socket connection
  const wasOffline = userSockets.size === 0;
  userSockets.add(socket.id);

  // Notify others only when the user first comes online
  if (wasOffline) {
    socket.broadcast.emit("userOnline", { userId });
    console.log("User is online:", userId);
  }

  // Keep your existing test event
  socket.on("test-message", (data) => {
    io.to(userId).emit("newMessage", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const sockets = onlineUsers.get(userId);

    if (!sockets) return;

    sockets.delete(socket.id);

    // Mark offline only when the last connection closes
    if (sockets.size === 0) {
      onlineUsers.delete(userId);

      socket.broadcast.emit("userOffline", { userId });
      console.log("User is offline:", userId);
    }
  });
});


const PORT = process.env.PORT || 5000 ;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(` Server running on ${PORT}`);
    });
});