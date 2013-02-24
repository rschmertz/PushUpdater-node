require(["updater-client"], function(updater) {
    updater = updater || window.updater;
    updater("points", null, { get: ['temp1', 'temp2', 'batt1', 'batt2'] });
    updater("events", null, { stream: 'sat5sim1'});
});