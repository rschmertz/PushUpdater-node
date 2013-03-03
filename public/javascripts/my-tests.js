require(["mocha", "chai", "updater-client"], function(dummy1, dummy2, updater) {
    updater = updater || window.updater;

    //dater("events", eventHandler, { stream: 'sat5sim1'});

    chai.should();
    mocha.setup({
        ui: 'bdd'
        ,timeout: 7000
    });

    function clienttest1(done) {
        function clientHandler(data) {

            console.log('clienthandler called');
            done();
        };
        updater("points", clientHandler, { get: ['temp1', 'temp2', 'batt1', 'batt2'] });
    };

    describe('Updater test', function () {
        it.skip('should handle subscription errors', function () {
            function junkHandler(data) {
                console.log('junkhandler called');
            };
        });
    });

    describe('Clienttest', function () {
        it('should get a callback', clientstest1);
        it('should continue after callback', function () {
        });
    });

    mocha.run();
    //pointstest1(function () {});
});