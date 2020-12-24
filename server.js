const express = require('express');
const http = require('http');
const socket = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socket(server);

let users = []

const messages = {
    general: [],
    random: [],
    jokes: [],
    javascript: [],
}

io.on('connection', socket => {
    socket.on('join server', (username) => {
      const user = {
          username,
          id: socket.id
      }
      users.push(user);
      io.emit('new user', users);
    });

    socket.on('join room', (roomName, cb) => {
        socket.join(roomName);
        cb(messages[roomName])
        // socket.emit('joined', messages[roomName])
    })

    socket.on('send message', ({ content, to, sender, chatName, isChannel }) => {
        const payload = {
            content, sender
        }
        if (isChannel) {
            payload.chatName = chatName
        } else {
            payload.chatName = sender
        }
        socket.to(to).emit('new message', payload);

        if (messages[chatName]) {
            messages[chatName].push(payload)
        }
    })

    socket.on('disconnect', () => {
        users = users.filter(u => u.id !== socket.id);
        io.emit('new user', users)
    })
})

const port = process.env.PORT || 1337;

server.listen(port, () => {
    console.log('server running in port 1337');
})