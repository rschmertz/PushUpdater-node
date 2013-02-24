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
        }

        // This is the main interface function for subscribing to data
        function updater(dest, cb, msg) {
            if (!cb) cb = {}; // TODO: GET RID OF
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
                    , guid: cb._updaterUse.guid
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
