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

/********************************************************************

  This file implements the client side of the PushUpdater.  It exposes
  a function, 'updater', which is the API function for making a
  subscription.  It detects for the use of RequireJS and exposes the
  API function as a module member if RequireJS is detected, or as a
  global function otherwise.

*********************************************************************/

(function() {
    // This function will be called once, at the end, to provide the updater
    // function/namespace to either the 'require' module system or to the
    // 'window' namespace.
    function getUpdater(io, _) {
        var socket = null
        , socketAlive = false
        , queuedGuidCBs = []
        , clientCounter = 0
        , localCBMap = {} // map based on page-local IDs, for temporary use
        , globalCBMap = {}; // map based on GUIDs from the server -- for permanent use

        // Only one socket connection should be made per page.  We
        // don't make a connection until a subscription request has
        // been made (i.e., 'updater' has been called)
        function createSocket() {
            if (socket) return;
            socket = io.connect();
            socket.on('alive', function (data) {
                console.log(data);
                socketAlive = true;

                // now that we've gotten an 'alive' from the server, it's safe
                // to call the various client callbacks that had been queued
                _.each(queuedGuidCBs, function(runsub) {
                    runsub();
                });
                queuedGuidCBs = [];
            });
            socket.on('assignGUID', function (data) {
                /* data looks like: * /
                   data = {
                       localid: 1,
                       guid: 4343525
                   }
                   /**/
                /**********************************************************

                  Each client callback object, when it initially makes a
                  subscription request, is assigned an ID that is unique to
                  the client application (browser page).  Here, we assign that
                  object the GUID provided by the 'getGUID' call, using
                  the local ID to find the callback object

                 **********************************************************/
                var cbo = localCBMap[data.localid];
                globalCBMap[data.guid] = cbo;
                cbo.cb._updaterUse.guid = data.guid;
                console.log("added guid %d from local %d", data.guid, data.localid);
                // Now kick off any queued subscription requests made by the object
                _.each(cbo.cb._updaterUse.queuedSubs, function (f) {f()});
                delete localCBMap[data.localid];
            });

            /*****************************************************************

               All subscription data comes through this callback.  Data comes
               as an array of updates.  Each update has a clientID, and a data
               "bundle".  We find the callback object associated with the
               clientID (the "guid"), and pass the data bundle to the object's
               callback method.

             *****************************************************************/
            socket.on('dataUpdate', function (data) {
                /**
                var sampleData =
                    [{ clientID: 1, bundle: {dataType: 'points', data: []}},
                     { clientID: 2, bundle: {dataType: 'events', data: []}}]
                /**/
                _.each(data, function (update) {
                    var cbo = globalCBMap[update.clientID];
                    /*
                      Support two types of callback:
                        - a pure function (deprecated)
                        - an object with an 'update' method.

                      Both the pure function and the 'update' method should have
                      the same signature
                     */
                    if (!cbo) {
                        console.log("No callback object for ID %d", update.clientID);
                        return;
                    }

                    if (typeof cbo.cb == 'function') {
                        // Note: function callback is deprecated.
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
                /* 

                  Create the _updaterUse property of the callback object.  All
                  data that the framework wants to be associated with a
                  callback object will be done either on the _updaterUse
                  property (especially in cases, like the guid, where the client
                  may want access to that info), or on a wrapper object to the
                  callback object
                 */
                cb._updaterUse = cb._updaterUse || {
                    queuedSubs: []
                };
            };
                    
            // Local ID to be used for the CBO until it gets a GUID
            var localID = clientCounter++;
            localCBMap[localID] = {
                cb: cb
            };

            /****************************************************************

             If CBO has a guid, we're ready to go; start the subscription.
             Otherwise, put the subscribing function on the queue;

             ****************************************************************/
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

            // Where the subscription is actually made.
            function runSubscription() {
                var subscribeMsg = {
                    destination: dest
                    , message: msg
                    , clientID: cb._updaterUse.guid
                }

                socket.emit("subscribe", subscribeMsg);
                console.log('Done  subscription for ' + dest);
            };
            if (!socket) {
                createSocket();
            };
            if (socketAlive) {
                checkGUID();
            } else {
                queuedGuidCBs.push(checkGUID);
            };

            return localID;
        };

        // Unsubscribe method
        updater.unsubscribe = function (cb) {
            var guid = cb._updaterUse.guid;
            delete globalCBMap[guid]; // Wow, that was easy.  /Too/ easy.
            cb.unsubscribed();
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
        // require doesn't exist; you'll have to make sure the appropriate script includes are present
        window.updater = getUpdater(io, _);
    };
})();
