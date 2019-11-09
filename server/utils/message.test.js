var expect = require('expect');
var {generateMessage, generateLocationMessage} = require('./message');

describe('generateMessage', () => {    
    it('should generate correct message object', () => {

        var from = 'Jen';
        var text = 'Some Message';
        var message = generateMessage(from, text);

        expect(message.createdAt).toBeA('number');
        expect(message).toInclude({from,text});
        

    });
});

describe('generateLocationMessage', () => {
    if('should generate correct location object', () => {
        var from = 'Dev';
        var lat = 1;
        var long = 12;
        var url = 'https://www.google.com/maps?q=1,12'
        var message = generateLocationMessage(from, lat, long);

        expect(message.createdAt).toBeA('number');
        expect(message).toInclude({from,url});
    });
});

