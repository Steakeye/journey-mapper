function feelingLucky(aStep, aQueryObj, aErrorFunc) {
    console.log('We got to eh feeling luck func!');
    return aQueryObj.find('.jsb')
        .filter('input[name="btnI"]')
        .click()
}

module.exports = feelingLucky;