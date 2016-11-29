"use strict";
var Page_1 = require('./Page');
exports.Page = Page_1.Page;
var Journey = (function () {
    function Journey(journey) {
        for (var prop in journey) {
            var journeyProperty = journey[prop];
            if (prop === 'pages') {
                for (var page in journey.pages) {
                    this.pages.push(new Page_1.Page(journey.pages[page]));
                }
            }
            else {
                this[prop] = journeyProperty;
            }
        }
    }
    return Journey;
}());
exports.Journey = Journey;
