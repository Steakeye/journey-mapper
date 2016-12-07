/**
 * Created by steakeye on 07/12/16.
 */
(function(aScope: any) {
    function isNode(aContext: any) {
        let hasTrueGlobal = global && (aContext === global) && (aContext === global.global),
            hasNotTrueWindow = !window || ((aContext !== window) && !window.window);

        return hasTrueGlobal && hasNotTrueWindow;
    }

    if (isNode(aScope)) {
        //Run CLI code
        console.log('Run CLI code...');
    } else {
        //Initialise browser code
    }
})(this)