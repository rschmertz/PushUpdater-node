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
    update: function (data) {
        console.log('eventhandler called, id = %d', this._updaterUse.guid);
        this.list.push({
            even: eventCounter % 2 == 0 ? true : false
            , data: data
        });
    }
    , list: ko.observableArray()
}

require(["updater-client"], function(updater) {
    updater = updater || window.updater;
    updater("points", pointHandler, { get: ['temp1', 'temp2', 'batt1', 'batt2'] });
    updater("events", eventHandler, { stream: 'sat5sim1'});
});