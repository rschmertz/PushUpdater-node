require(["mocha", "chai", "updater-client"], function(dummy1, dummy2, updater) {
    updater = updater || window.updater;

    //dater("events", eventHandler, { stream: 'sat5sim1'});

    chai.should();
    mocha.setup({
        ui: 'bdd'
        ,timeout: 7000
    });

    function pointstest1(done) {
        function pointHandler(data) {

            console.log('pointhandler called');
            done();
        };
        updater("points", pointHandler, { get: ['temp1', 'temp2', 'batt1', 'batt2'] });
    };

    describe('Pointstest', function () {
        it('should get a callback', pointstest1);
        it('should continue after callback', function () {
        });
    });

    mocha.run();
    //pointstest1(function () {});
});