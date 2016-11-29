"use strict";
var Page = (function () {
    function Page(page) {
        for (var p in page) {
            this[p] = page[p];
        }
    }
    return Page;
}());
exports.Page = Page;
