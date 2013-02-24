(function() {
    function getUpdater(io) {
        function updater() {
            alert('in updater');
        };
        return updater;
    };

    if (typeof io == 'undefined') {
        define(['/socket.io/socket.io.js'],getUpdater);
    } else {
        window.updater = getUpdater(io);
    };
})();
