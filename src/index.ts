/**
 * Created by steakeye on 07/12/16.
 */
(function(aScope: any) {
    function hasTrueGlobal(aThis: Window | NodeJS.Global): boolean {
        var tGlobal = typeof global !== 'undefined' ? global: undefined;
        return tGlobal && (aThis === tGlobal) && (aThis === tGlobal.global);
    }

    function isNode(aContext: any): Boolean {
        let hasNotTrueWindow = typeof window === 'undefined' || ((aContext !== window) && !window.window);

        return hasTrueGlobal(this) && hasNotTrueWindow;
    }

    if (isNode(aScope)) {
        //Run CLI code
        console.log('Run CLI code...');
        const CLI = require('./cli/CLI');
        let cli = new CLI(process.argv);
    } else {
        //Initialise browser code
        console.log('Run browser code...');
    }
})(this)