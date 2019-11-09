var socket = io();
socket.on('connect', function () {
    console.log('connected');

});
socket.on('disconnect', function () {
    console.log('disconnected')
});

socket.on('newMessage', function(msg){
    console.log('newMessage'+ JSON.stringify(msg));
    var li = jQuery('<li></li>');
    li.text(`${msg.from}: ${msg.text}`);
    jQuery('#messages').append(li);
});


socket.on('newLocationMessage', function(message){
    var li = jQuery('<li></li>');
    var a  = jQuery('<a target="_blank", >My Current location</a>');
    li.text(`${message.from}: `);
    a.attr('href', message.url);
    li.append(a);
    jQuery('#messages').append(li);
});

jQuery('#message-form').on('submit', function(e) {
    e.preventDefault();
    socket.emit('createMessage', {
        from: 'User',
        text: jQuery('[name=message]').val()
    }, function() {
    });
});


var loctionButton  = jQuery('#send-location');
loctionButton.on('click', function() {
    if(!navigator.geolocation) {
        return alert('Geolocation not supported by your browser');
    }
    navigator.geolocation.getCurrentPosition(function(position){
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function() {
        alert('Unable to print location');
    });
});



