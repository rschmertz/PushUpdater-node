var fdsfdfsdfsd = 0
, io = require('socket.io');

function doHello() {
    console.log("helllooooooooooooo!");
}

exports.doHello = doHello;

exports.listen = function (httpServer) {
    ioServer = io.listen(httpServer);

    ioServer.sockets.on('connection', function (socket) {
        socket.emit('alive', { date: (new Date().toString()) });
    });
};
