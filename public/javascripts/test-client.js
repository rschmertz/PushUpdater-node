/* Deprecated: pure callback */


var pointHandler = {
    update: function (update) {
        console.log('pointhandler called, id = %d', this._updaterUse.guid);
        //console.log('point value is' + data);
        this.value(update.data);
    }
    , value: ko.observable(0)
}

ko.applyBindings(pointHandler, document.getElementById("pointupdater"))

var eventCounter = 0;

var eventHandler = {
    update: function (update) {
        console.log('eventhandler called, id = %d', this._updaterUse.guid);
        this.list.push({
            even: eventCounter % 2 == 0 ? true : false
            , data: update.data
        });
    }
    , list: ko.observableArray()
}

ko.applyBindings(eventHandler, document.getElementById("eventoutput"))

require(["updater-client"], function(updater) {
    updater = updater || window.updater;
    updater("points", pointHandler, { get: ['temp1', 'temp2', 'batt1', 'batt2'] });
    updater("events", eventHandler, { stream: 'sat5sim1'});
});