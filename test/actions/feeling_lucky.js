function feelingLucky(aStep, aQueryObj, aErrorFunc) {
    console.log('We got to the feeling luck func!');
    /*return aQueryObj.find('.jsb > center')
    //.html()
    /*.then(function(value) {
     console.log('found value of .jsb > center:' + value)
     })*\/
    //.children('input[name="btnI"]')
    .find('input[name="xbtnI"]')
    //.val()
    //.html()
    .then(function(value) {
        console.log('value for input[name="btnI"]:' + value)
        if (value.length) {
            return value;
        } else {
            //return Promise.reject('input[name="xbtnI"] not found');
            Promise.reject('input[name="xbtnI"] not found');
        }
    },
    aErrorFunc
    );*/
    //.click();
    function makeRejection(aErrorCB) {
        return function rejectInteraction(aError) {
            aErrorCB(aError)
        }
    }

    function makeResolution(aResolveCB, aRejectCB){
        return function testInteraction(aUrl) {
            if (value.length) {
                return value;
            } else {
                //return Promise.reject('input[name="xbtnI"] not found');
                Promise.reject('input[name="xbtnI"] not found');
            }
        }
    }

    function tryToClick(aOnResolve, aOnReject) {
        var buttonToClick = aQueryObj.find('.jsb > center')
            .find('input[name="btnI"]');

        buttonToClick.then(function(value) {
                 console.log('value for input[name="btnI"]:' + value);
                 if (value.length) {
                    //return value;
                     //return aQueryObj(value).click();
                     //return buttonToClick.click().then(aOnResolve, aOnReject);
                     //TODO!
                     Promise.resolve(buttonToClick.click().then(aOnResolve, aOnReject));
                 } else {
                 //return Promise.reject('input[name="xbtnI"] not found');
                    //Promise.reject('input[name="xbtnI"] not found');
                     //return buttonToClick.reject('input[name="xbtnI"] not found');
                     aOnReject('input[name="xbtnI"] not found');
                 }
            },
            aErrorFunc
            );
    }

    return new Promise(tryToClick);
}

module.exports = feelingLucky;