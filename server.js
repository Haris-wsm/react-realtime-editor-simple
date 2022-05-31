require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./Actions');
// cors

const corsOption = {
  credentials: true,
  origin: ['http://localhost:3000']
};

const app = express();

app.use(cors(corsOption));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000L',
    methods: ['GET', 'POST']
  }
});

app.use(express.static('build'));

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const userSocketMap = {};

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => ({ socketId, username: userSocketMap[socketId] })
  );
}

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  // JOIN room
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);

    clients.forEach(({ socketId }) =>
      io.to(socketId).emit(ACTIONS.JOINED, { clients, username, socketId })
    );
  });

  // Code Change
  socket.on(ACTIONS.CODE_CHANCE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANCE, { code });
  });

  // Sync Code
  socket.on(ACTIONS.SYNC_CODE, ({ roomId, code }) => {
    io.to(roomId).emit(ACTIONS.CODE_CHANCE, { code });
  });

  // LEAVE room
  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id]
      });
    });

    delete userSocketMap[socket.id];
    socket.leave();
  });
});

const PORT = process.env.PORT || 5500;

server.listen(PORT, () => console.log(`app listen on port ${PORT}`));
