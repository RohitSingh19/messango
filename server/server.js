const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New User Connected');


    socket.emit('newMessage',{
        from : 'Admin',
        text:'Welcome to chat',
        createdAt: new Date().getTime()
    });

    socket.broadcast.emit('newMessage', {
        from : 'Admin',
        text:'New User joined',
        createdAt: new Date().getTime()
    });


    socket.on('createMessage', (msg) => {
        console.log(msg);
        io.emit('newMessage', {
            from : msg.from,
            text:msg.text,
            createdAt: new Date().getTime()
        });
    });



    socket.on('disconnect', () => {
        console.log('disconnected')
    });
});


server.listen(port, () => {
    console.log(`Server is up and running on ${port}`);
});

