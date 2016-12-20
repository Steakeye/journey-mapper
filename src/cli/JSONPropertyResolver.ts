///<reference path="../../typings/index.d.ts" />

import ErrorHandler from './ErrorHandler';

//import * as JSONRefs from 'json-refs';
var JSONRefs = require('json-refs');

module jm.cli {
    /*TODO:
    I want to hve an object that defines how to interact with a property
    If a property key is found, then the property type is checked
    If the type of the value is string then the json resolve will try to resolve the content as JSON and replace the string
    If the string does not resolve to an error then the JSON resolver quites and causes a fail event
    Otherwise, when an object is found or resolved, it's type is checked and it does not match the expected type, a fail event is thrown
    When the value matches the type then the children are checked for resolution unless a checkChildStrings flag is set to false
    All children of object types will be checked against resolution declarations

    maybe use something like:
     https://www.npmjs.com/package/tree-crawl

    * */

    export interface IJSONPropertyResolve {
        property: string;
        //type: { new(): any };
        checkChildStrings?: boolean;
    }

    const JOURNEYS_RESOLUTION_FAILED: string = "JSON references failed to be resolved. ";

    export function JSONPropertyResolver(aJSObject: Object, aBasePath: string): Promise<Object> {
        let config:JsonRefs.JsonRefsOptions = {
                relativeBase: aBasePath
            },
            resolution: Promise<Object> = JSONRefs.resolveRefs(aJSObject, config);
        return resolution.catch<Object>(ErrorHandler.setupPromiseErrorHandler(JOURNEYS_RESOLUTION_FAILED, aJSObject));
    }
}

export default jm.cli.JSONPropertyResolver;
