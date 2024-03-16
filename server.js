// Import necessary modules
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const handleFriendEvents = require("./utils/handleFriendEvents");
const handleMessageEvents = require("./utils/handleMessageEvents");
// environmental variables
dotenv.config();

// Initialize express app
const app = express();

app.use(cors({ origin: process.env.ALLOWED_ORIGIN, credentials: true }));

app.use(cookieParser()); 

// Create a server instance
const server = http.createServer(app);

// user list for connected clients to socket
const userSocketMap = {};

// Initialize Socket.IO
const io = socketIO(server);

// Define a route
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "welcome to socket.io server",
  });
});

// Socket.IO event handling
io.on("connect", (socket) => {
  const id = socket.handshake.query.id;
  userSocketMap[id] = socket.id;
  console.log(`client connect to socket id ${socket.id}`);
  console.log(userSocketMap);

  handleFriendEvents(socket, userSocketMap);
  handleMessageEvents(socket, userSocketMap);
  socket.on("disconnect", () => {
    console.log(`client discnnected for socket id ${socket.id}`);
    for (let userId in userSocketMap) {
      if (userSocketMap[userId] == socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
    console.log(userSocketMap);
  });
});

// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
