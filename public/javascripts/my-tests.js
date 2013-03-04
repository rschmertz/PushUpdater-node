require(["mocha", "chai", "updater-client"], function(dummy1, chai, updater) {
    updater = updater || window.updater;

    //dater("events", eventHandler, { stream: 'sat5sim1'});

    chai.should();
    mocha.setup({
        ui: 'bdd'
        ,timeout: 9000
    });

    var clientHandler;

    function clienttest1(done) {
        clientHandler = {
            update: function(data) {

                console.log('clienthandler called');
                done();
            }
            , unsubscribed: function (success) {
                this.update = function (data) {
                    throw('got an update when they should have stopped');
                };
            }
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
        it('should get a callback', clienttest1);
        it('should continue after callback', function () {
        });
        it('should honor unsubscribe', function (done) {
            /*
              1. call unsubscribe
              2. after 1 sec, replace update cb with one that throws an error
              3. wait 7 sec for test completion
              */
            clientHandler.should.have.property('unsubscribed');
            updater.unsubscribe(clientHandler);
            setTimeout(function () {
                console.log('==============done waiting for errors');
                done();
            }, 7000);
            
        });
    });

    mocha.run();
    //pointstest1(function () {});
});