function searchForHMRC(aStep, aQueryObj, aErrorFunc) {
    //console.log('We got to the feeling luck func!');

var textFieldToUse = aQueryObj.find('#orb-banner')
    .find('#orb-search-q'),
    searchQuery = 'HMRC';

return textFieldToUse.then(function(value) {
         //console.log('value for input[name="btnI"]:' + value);
         if (value.length) {
             return textFieldToUse.click().type(searchQuery).then(function(aVal) {
                return aQueryObj.find(':focus');
             }).then(function(aVal) {
                 return aStep.nav.sendKey(aVal, "ENTER");
             }).then(function() {
                 return true;
             });
         } else {
             return false;
         }
    },
    function (aError) {
        //console.log('textFieldToUse - rejected');
        aErrorFunc(aError)
    }
    );
}

module.exports = searchForHMRC;