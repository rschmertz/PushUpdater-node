var fdsfdfsdfsd = 0
, fakeDataQueue = []
, io = require('socket.io');

function addFakeData(guidList) {
    var rand = Math.random();
    var destination;
    var msg = {
        bundle: {
            data: rand
        }
    }
    if (fakeDataQueue.length < 6) {
        if (rand > 0.5) {
            destination = 'points';
        } else {
            destination = 'events';
        }
        for (var k in guidList) {
            console.log("{%s: %s}", k, guidList[k]);
            if (guidList[k] == destination) {
                msg.clientID = k;
                break;
            }
        }
        msg.bundle.dataType = destination;
        fakeDataQueue.push(msg);
    };
};

exports.listen = function (httpServer) {
    var guidCounter = 500,
    ioServer = io.listen(httpServer);

    ioServer.sockets.on('connection', function (socket) {
        var guidList = {};

        socket.emit('alive', { date: (new Date().toString()) });
        console.log("Here's a console output");
        socket.on('getGUID', function(data) {
            console.log("getGUID called");
            socket.emit('assignGUID', { localid: data.localid, guid: guidCounter++ });
        });
        socket.on('subscribe', function(data) {
            console.log('Incoming subscription: ' + data.destination.toString());
            guidList[data.clientID] = data.destination;
        });
        setInterval(function () { addFakeData(guidList) }, 700);
        setInterval(function () {
            socket.emit('dataUpdate', fakeDataQueue);
            fakeDataQueue = [];
        }, 2200);
    });
};
