function feelingLucky(aStep, aQueryObj, aErrorFunc) {
    console.log('We got to the feeling luck func!');

var buttonToClick = aQueryObj.find('.jsb > center')
    .find('input[name="btnI"]');

return buttonToClick.then(function(value) {
         console.log('value for input[name="btnI"]:' + value);
         if (value.length) {
             return buttonToClick.click();
         } else {
             aErrorFunc('input[name="xbtnI"] not found');
         }
    },
    aErrorFunc
    );
}

module.exports = feelingLucky;