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
(function() {
    function getUpdater(io, _) {
        var socket = null
        , socketAlive = false
        , queuedCBs = []
        , clientCounter = 0
        , localCBMap = {} // map based on page-local IDs, for temporary use
        , globalCBMap = {} // map based on GUIDs from the server -- for permanent use
        , socketURL = 'http://localhost:3000';

        function createSocket() {
            if (socket) return;
            socket = io.connect('http://localhost:3000');
            socket.on('alive', function (data) {
                console.log(data);
                socketAlive = true;
                _.each(queuedCBs, function(runsub) {
                    runsub();
                });
                queuedCBs = [];
            });
            socket.on('assignGUID', function (data) {
                /* data looks like: * /
                   data = {
                   localid: 1,
                   guid: 4343525
                   }
                   /**/
                //alert('in assignGUID');
                var cbo = localCBMap[data.localid];
                globalCBMap[data.guid] = cbo;
                cbo.cb._updaterUse.guid = data.guid;
                console.log("added guid %d from local %d", data.guid, data.localid);
                _.each(cbo.cb._updaterUse.queuedSubs, function (f) {f()});
                delete localCBMap[data.localid];
            });
            socket.on('dataUpdate', function (data) {
                /**
                var sampleData =
                    [{ clientID: 1, bundle: {dataType: 'points', data: []}},
                     { clientID: 2, bundle: {dataType: 'events', data: []}}]
                /**/
                _.each(data, function (update) {
                    var cbo = globalCBMap[update.clientID];
                    /*
                      Support two tyes of callback:
                        - a pure function 
                        - an object with an 'update' method.

                      Both the pure function and the 'update' method should have
                      the same signature
                     */
                    if (typeof cbo.cb == 'function') {
                        cbo.cb(update.bundle);
                    } else {
                        cbo.cb.update(update.bundle);
                    }
                });
            });
        }

        // This is the main interface function for subscribing to data
        function updater(dest, cb, msg) {
            if (cb) {
                cb._updaterUse = cb._updaterUse || {
                    queuedSubs: []
                };
            };
                    
            var localID = clientCounter++;
            //alert('in updater');
            localCBMap[localID] = {
                cb: cb
            }
            var id = Math.ceil(Math.random() * 99999999)
            , subscriptionDone = false;

            function checkGUID() {
                if (!cb._updaterUse.guid) {
                    if (!cb._updaterUse.guidPending) {
                        socket.emit("getGUID", {localid: localID});
                        cb._updaterUse.guidPending = true;
                    };
                    cb._updaterUse.queuedSubs.push(runSubscription);
                } else {
                    runSubscription();
                }
            };
            
            function runSubscription() {
                var subscribeMsg = {
                    destination: dest
                    , message: msg
                    , clientID: cb._updaterUse.guid
                }

                socket.emit("subscribe", subscribeMsg);
                subscriptionDone = true;
                console.log('Done  subscription for ' + dest);
            };
            if (!socket) {
                createSocket();
            };
            if (socketAlive) {
                checkGUID();
            } else {
                queuedCBs.push(checkGUID);
            };

            return id;
        };
        return updater;
    };

    if (typeof requirejs != 'undefined') {
        requirejs.config({
            shim: {
                'underscore-min': {
                    exports: '_'
                }
            }
        });
        define(['/socket.io/socket.io.js', 'underscore-min'],getUpdater);
    } else {
        // require doesn't exist; you'll have to make sure the appropriate underscore.js file tag is present
        window.updater = getUpdater(io, _);
    };
})();
