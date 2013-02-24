(function() {
    function getUpdater(io) {
        function updater(dest, cb, msg) {
            alert('in updater');
            var id = Math.ceil(Math.random() * 99999999);
            var socket = io.connect('http://localhost:3000');
            socket.on('alive', function (data) {
                console.log(data);
            });
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
