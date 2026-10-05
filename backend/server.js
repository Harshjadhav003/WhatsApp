require("dotenv").config();
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

io.on("connection", (socket) => {
    console.log("New socket connected:", socket.id);
});

const PORT = process.env.PORT || 5000 ;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(` Server running on ${PORT}`);
    });
});