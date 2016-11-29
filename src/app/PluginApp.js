"use strict";
var Journey_1 = require('../core/Journey');
var PluginApp = (function () {
    function PluginApp(fileList, file) {
        var fileArray = new Array();
        var counter = 0;
        if (fileList) {
            for (; counter < fileList.length; counter++) {
                fileArray.push(fileList.item(counter));
            }
        }
        else {
            fileArray.push(file);
        }
    }
    PluginApp.prototype.getJourneys = function (configs) {
        var j = 0;
        var jLength = configs.length;
        for (; j < jLength; j++) {
            var config = configs[j];
            this.journeys.push(new Journey_1.Journey(config));
        }
    };
    return PluginApp;
}());
