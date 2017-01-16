function findAboutDoodles(aStep, aQueryObj, aErrorFunc) {
    //console.log('We got to the feeling luck func!');

var aboutLinkToClick = aQueryObj.find('#nav-list')
    .find('a[href="/doodles/about"]');

return aboutLinkToClick.then(function(value) {
         //console.log('value for input[name="btnI"]:' + value);
         if (value.length) {
             return aboutLinkToClick.click().then(function () {
                 return true;
             });
         } else {
             return false;
         }
    },
    function (aError) {
        //console.log('aboutLinkToClick - rejected');
        aErrorFunc(aError)
    }
    );
}

module.exports = findAboutDoodles;