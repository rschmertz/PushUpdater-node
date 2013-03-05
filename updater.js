/********************************************************************

  Copyright 2013 by Robert Schmertz <rschmertz at yahoo dot com>

  This file is part of PushUpdater-node.

  PushUpdater-node is free software: you can redistribute it and/or
  modify it under the terms of the GNU General Public License
  as published by the Free Software Foundation, either version 3 of
  the License, or (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.

*********************************************************************/
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

    // A socket for listening to data providers
    var dataClient = io.listen(6668);
    var providerList = {};

    dataClient.sockets.on('connection', function (socket) {
        socket.emit('alive', { date: (new Date().toString()) });
        socket.on('data-provider', function (data, fn) {
            console.log("we got here!!!");
            // data looks like { name: "points" }
            if (typeof providerList[data] == 'undefined') {
                providerList[data] = true;
            } else {
                console.log("there's already a provider with that name.");
                if (fn) {
                    fn({error: "Already a provider with that name."});
                };
            };
        });
        socket.on('dataUpdate', function (data, fn) {
            if (typeof providerList[data] == 'undefined') {
                if (fn) {
                    fn({error: 'Your data provider has not provided a unique name'});
                    return;
                } else {
                };
            };
        });
    });
};
