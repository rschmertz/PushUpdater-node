(function() {
    function getUpdater(io, _) {
        var socket = null
        , socketAlive = false
        , socketURL = 'http://localhost:3000';

        // This is the main interface function for subscribing to data
        function updater(dest, cb, msg) {
            alert('in updater');
            var id = Math.ceil(Math.random() * 99999999)
            , subscriptionDone = false;
            
            function runSubscription() {
                if (subscriptionDone)
                    return;
                socket.emit("subscribe", {destination: dest, message: msg});
                subscriptionDone = true;
                console.log('Done  subscription for ' + dest);
            };
            if (!socket) {
                socket = io.connect('http://localhost:3000');
                socket.on('alive', function (data) {
                    console.log(data);
                    socketAlive = true;
                    runSubscription();
                });
                
            };
            if (socketAlive) {
                runSubscription();
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
