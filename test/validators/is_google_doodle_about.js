function isGoogleHome(aStep, aQueryObj, aErrorFunc) {
    var urlToMatch = "https://www.google.com/doodles/about";

    console.log('We got to google doodle about page validator!');

    function makeRejection(aErrorCB) {
        return function rejectUrl(aError) {
            aErrorCB(false)
        }
    }

    function makeResolution(aResolveCB, aRejectCB){
        return function testUrl(aUrl) {
            if (aUrl === urlToMatch) {
                aResolveCB(true);
            } else {
                aRejectCB(false);
            }
        }
    }

    function getUrlAndResolve(aOnResolve, aOnReject) {
        aStep.nav.getCurrentUrl().then(makeResolution(aOnResolve, aOnReject), makeRejection(aOnReject));
    }

    return new Promise(getUrlAndResolve);
}

module.exports = isGoogleHome;