const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');


const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');


const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;


var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New User Connected');  

    socket.on('join', (params, callback) => {
        debugger;
        if(!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and room name are required.');
        }

        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);
        //socket.leave(params.room)

        io.to(params.room).emit('updateUserList', users.getUserList(params.room));
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
        socket.broadcast.to(params.room).emit('newMessage',generateMessage('Admin', `${params.name} has joined.`));

        callback();
    });

    socket.on('createMessage', (msg, callback) => {
        console.log(msg);
        io.emit('newMessage', generateMessage(msg.from, msg.text));
        callback('This is the string');
    });

    socket.on('createLocationMessage', (coords) => {
        io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude,coords.longitude));
    });

    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id);
        if(user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
        }
    });
});


server.listen(port, () => {
    console.log(`Server is up and running on ${port}`);
});

