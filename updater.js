var fdsfdfsdfsd = 0
, io = require('socket.io');

function doHello() {
    console.log("helllooooooooooooo!");
}

exports.doHello = doHello;

exports.listen = function (httpServer) {
    io.listen(httpServer);
};
