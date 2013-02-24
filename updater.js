var fdsfdfsdfsd = 0
, io = require('socket.io');

exports.listen = function (httpServer) {
    ioServer = io.listen(httpServer);

    ioServer.sockets.on('connection', function (socket) {
        socket.emit('alive', { date: (new Date().toString()) });
        console.log("Here's a console output");
        socket.on('subscribe', function(data) {
            console.log('Incoming subscription: ' + data.destination.toString());
        })
    });
};
