var socket = io();

function scrollToBottom() {    
    var messages = jQuery('#messages');
    var newMessage = messages.children('li:last-child');
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();

    if(clientHeight + scrollTop  + newMessageHeight + lastMessageHeight>= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}


socket.on('connect', function () { 
    var params = jQuery.deparam(window.location.search);
    

    socket.emit('join', params, function(err) {
        if(err) {
            alert(err);
            window.location.href = '/';
        } else {
            
            console.log('No Error');   
            var template = $('#template').html();
            Mustache.parse(template);   // optional, speeds up future uses
            var chatRoom = params.room;
            var rendered = Mustache.render(template, {name: chatRoom.toUpperCase()});

            $('#target').html(rendered);

        };
    });
});
socket.on('disconnect', function () {
    console.log('disconnected')
});


socket.on('updateUserList', function(users) {
    var ol = jQuery('<ol></ol>');
    
    users.forEach(function(user) {
        ol.append(jQuery('<li></li>').text(user));
    });
    jQuery('#users').html(ol); 
});

$("#msgBox").bind("keypress", function(){    
    var params = jQuery.deparam(window.location.search);
    socket.emit('typing', params);
});

socket.on('notifyTyping', function(msg){
    var html = `${msg.from} is typing..`;    
    // jQuery('#messages').append('');    
    console.log(html);
    jQuery('.notifyArea').html(html);    
});




// public method for encoding an Uint8Array to base64
function encode (input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    while (i < input.length) {
        chr1 = input[i++];
        chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
        chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }
        output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                  keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }
    return output;
}

$("#upload").change(function(e) {
    var data = e.originalEvent.target.files[0];
    readThenSendFile(data);   
});

function readThenSendFile(data){
    debugger;
    var reader = new FileReader();
    var params = jQuery.deparam(window.location.search);
    reader.onload = function(evt){        
        socket.emit('base64_file', data, params);
    };
    reader.readAsDataURL(data);
}



socket.on('newMessage', function(msg){      
    var formattedTime = moment(msg.createdAt).format('LT');
    var template = jQuery('#message-template').html();    
    var html = Mustache.render(template, {
        text: msg.text,
        from: msg.from,
        createdAt: formattedTime
    });   
   
    var params = jQuery.deparam(window.location.search);

    if(params.name === msg.from) {
        var html = `<div class="container_right pull-right">                
        <h2 class="sender" style="color:#e6eaee">${msg.from}</h2>
        </br>
        <p>${msg.text}</p>
        <span class="time-right" style="color:#e6eaee">${formattedTime}</span>
        </div>`;    
    } else {
        var html = `<div class="container">                
        <h2 class="sender">${msg.from}</h2>
        </br>
        <p>${msg.text}</p>
        <span class="time-right">${formattedTime}</span>
        </div>`;    
    }
    jQuery('#messages').append(html);    
    jQuery('.notifyArea').empty();    
    scrollToBottom();
});




socket.on('newLocationMessage', function(message){
    var formattedTime = moment(message.createdAt).format('LT');
    var template = jQuery('#location-message-template').html();
    var html = Mustache.render(template, {
        url: message.url,
        from: message.from,
        createdAt: formattedTime
    });
    jQuery('#messages').append(html);
    jQuery('.notifyArea').empty();    
    scrollToBottom();
});


socket.on('drawImage', function(data, msg) {  
    var d = new Date();
    var formattedTime = moment(d).format('LT');
    var bytes = new Uint8Array(data);
    var image = document.createElement('img');
    image.src = 'data:image/png;base64,'+encode(bytes);
    image.width = "325";
    image.height = "240";

    var html = `<div class="container">                
    <h2 class="sender">${msg.name}</h2>
    </br>
    ${image.outerHTML}
    <span class="time-right">${formattedTime}</span>
    </div>`;    


    // console.log(newImage.outerHTML);
    //document.querySelector('.img').innerHTML = image.outerHTML;//where to insert your image
    jQuery('#messages').append(html);    
});


jQuery('#message-form').on('submit', function(e) {
    e.preventDefault();
    var messageTextBox = jQuery('[name=message]');
    socket.emit('createMessage', {        
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



jQuery("#clear-chat").click(function(){
    jQuery('#messages').empty();    
});
