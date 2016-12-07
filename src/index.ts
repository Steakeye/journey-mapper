/**
 * Created by steakeye on 07/12/16.
 */
(function(aScope: any) {
    function isNode(aContext: any) {
        let hasTrueGlobal = global && (aContext === global) && (aContext === global.global),
            hasNotTrueWindow = typeof window === 'undefined' || ((aContext !== window) && !window.window);
        var tB = false;

        return hasTrueGlobal && hasNotTrueWindow;
    }

    if (isNode(aScope)) {
        //Run CLI code
        console.log('Run CLI code...');
    } else {
        //Initialise browser code
        console.log('Run browser code...');
    }
})(this)