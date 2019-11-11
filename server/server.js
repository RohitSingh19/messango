const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');



const {generateMessage, generateLocationMessage, generateMessageTemplate} = require('./utils/message');
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

    socket.on('typing', (params)=> {
        socket.broadcast
            .to(params.room).
             emit('notifyTyping', generateMessage(`${params.name}`, `admin`));
    })

    socket.on('createMessage', (msg, callback) => {
        var user = users.getUser(socket.id);        
        if(user && isRealString(msg.text)) {
            io.to(user.room).emit('newMessage',
                 generateMessageTemplate(user.name, msg.text, socket.id));
        }
        callback();
    });

    socket.on('createLocationMessage', (coords) => {
        var user = users.getUser(socket.id);            
        if(user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude,coords.longitude));
        }
    });

    socket.on('base64_file', function (data, params) {      
        var user = users.getUser(socket.id); 
        io.to(user.room).emit('drawImage', data, params) ;
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


