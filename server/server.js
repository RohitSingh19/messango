const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');


const {generateMessage} = require('./utils/message');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New User Connected');


    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));

    socket.broadcast.emit('newMessage',generateMessage('Admin', 'New user join'));


    socket.on('createMessage', (msg, callback) => {
        console.log(msg);
        io.emit('newMessage', generateMessage(msg.from, msg.text));
        callback('This is the string');
    });



    socket.on('disconnect', () => {
        console.log('disconnected')
    });
});


server.listen(port, () => {
    console.log(`Server is up and running on ${port}`);
});

