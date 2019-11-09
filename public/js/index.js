var socket = io();

socket.on('connect', function () {
    console.log('connected');

});
socket.on('disconnect', function () {
    console.log('disconnected')
});

socket.on('newMessage', function(msg){    
    var formattedTime = moment(msg.createdAt).format('LT');
    var li = jQuery('<li></li>');
    li.text(`${msg.from}: ${formattedTime}: ${msg.text}`);
    jQuery('#messages').append(li);
});


socket.on('newLocationMessage', function(message){
    var formattedTime = moment(message.createdAt).format('LT');
    var li = jQuery('<li></li>');
    var a  = jQuery('<a target="_blank", >My Current location</a>');
    li.text(`${message.from}: ${formattedTime} `);
    a.attr('href', message.url);
    li.append(a);
    jQuery('#messages').append(li);
});

jQuery('#message-form').on('submit', function(e) {
    e.preventDefault();

    var messageTextBox = jQuery('[name=message]');

    socket.emit('createMessage', {
        from: 'User',
        text: messageTextBox.val()
    }, function() {
        messageTextBox.val('');
    });
});


var loctionButton  = jQuery('#send-location');
loctionButton.on('click', function() {
    if(!navigator.geolocation) {
        return alert('Geolocation not supported by your browser');
    }

    loctionButton.attr('disabled', 'disabled').text('Sending location..');

    navigator.geolocation.getCurrentPosition(function(position){
        loctionButton.removeAttr('disabled').text('Send Location');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function() {
        alert('Unable to print location').text('Send Location');
        loctionButton.removeAttr('disabled');
    });
});



