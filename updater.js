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

var montyPythonQuotes = [
    "She turned me into a newt!"
    , "Then you must cut down the mightiest tree in the forest... with... a herring!"
    , "Now go away or I shall taunt you a second time."
    , "It's just a flesh wound."
    , "Oh, king eh? Very nice. And how'd you get that, eh? By exploiting the workers. By hanging on to outdated imperialist dogma which perpetuates the economic and social differences in our society."
    , "Listen, strange women lyin' in ponds distributin' swords is no basis for a system of government."
    , "Oh, but you can't expect to wield supreme executive power just because some watery tart threw a sword at you."
    , "On second thought, let's not go to Camelot. It is a silly place."
    , "What... is the air-speed velocity of an unladen swallow? "
    , 'We are now the Knights who say... "Ekki-Ekki-Ekki-Ekki-PTANG. Zoom-Boing. Z\'nourrwringmm".'
];

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
            var index = Math.floor(20 * rand);
            var date = new Date();
            msg.bundle.data = {
                message: montyPythonQuotes[index]
                , randomValue: 2 * rand
                , date: date.toString()
            }
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
                socket.set('sourceName', data);
            } else {
                console.log("there's already a provider with that name.");
                if (fn) {
                    fn({error: "Already a provider with that name."});
                };
            };
        });
        socket.on('dataUpdate', function (data, fn) {
            socket.get('sourceName', function (err, name) {
                if (!name) {
                    fn && fn({error: 'Your data provider has not provided a unique name'});
                } else {
                    console.log("Source <%s> provided update %d", name, data);
                };
            })
        });
    });
};
