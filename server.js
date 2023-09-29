const path = require('path');
const express = require('express');
const config = require('dotenv').config;
const http = require('http');
const socketio = require('socket.io')
const formatMessage = require('./utils/messages');
const botName = 'ChaCord Bot';
const { getCurrentUser, userJoin, getRoomUsers, userLeave } = require('./utils/users');

config();

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

//Run when client connects
io.on('connection', (socket) => {

    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room)
        socket.join(user.room)

         //Broadcast when user connects(only to user)
        socket.emit('message', formatMessage(botName,'Welcome to chat'));

        //Broadcast when user connects(everyone expect user)
        socket.broadcast.to(user.room).emit('message', formatMessage(botName,`A ${user.username} has logged in chat`));

        //send user and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })


    //console.log('New ws connection');

    //Broadcast when user connects(everyone)
    //io.emit()

    //Listen for chat message

    socket.on('chatMessage', (message) => {
        //emit to everybody

        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username,message));
    });

     //Broadcast when user disconnects(everyone)
     socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user) {
            io.to(user.room).emit('message', formatMessage(botName,`A ${user.username} has left the chat`));

            //send user and room info
            io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
        }

        
    })
});

server.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}`));