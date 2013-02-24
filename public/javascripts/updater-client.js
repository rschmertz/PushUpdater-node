(function() {
    function updater() {
        alert('in updater');
    };

    if (define) {
        define(function(){
            return updater;
        });
    } else {
        window.updater = updater;
    };
})();
