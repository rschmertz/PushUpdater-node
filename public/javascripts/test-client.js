/* Deprecated: pure callback */
function pointHandler(data) {
    console.log('pointhandler called, id = %d', pointHandler._updaterUse.guid);
};

var eventHandler = {
    update: function (data) {
        console.log('eventhandler called, id = %d', this._updaterUse.guid);
    }
}

require(["updater-client"], function(updater) {
    updater = updater || window.updater;
    updater("points", pointHandler, { get: ['temp1', 'temp2', 'batt1', 'batt2'] });
    updater("events", eventHandler, { stream: 'sat5sim1'});
});