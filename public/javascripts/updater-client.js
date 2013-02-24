(function() {
    function getUpdater(io) {
        var socket = null
        , socketAlive = false
        , socketURL = 'http://localhost:3000';

        // This is the main interfac e function for subscribing to data
        function updater(dest, cb, msg) {
            alert('in updater');
            var id = Math.ceil(Math.random() * 99999999)
            , subscriptionDone = false;
            
            function runSubscription() {
                socket.emit("subscribe", {destination: dest, message: msg});
            };
            if (!socket) {
                socket = io.connect('http://localhost:3000');
                socket.on('alive', function (data) {
                    console.log(data);
                    runSubscription();
                });
                
            } else {
                runSubscription();
            };
            return id;
        };
        return updater;
    };

    if (typeof io == 'undefined') {
        define(['/socket.io/socket.io.js'],getUpdater);
    } else {
        window.updater = getUpdater(io);
    };
})();
