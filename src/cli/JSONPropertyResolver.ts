///<reference path="../../typings/index.d.ts" />

import ErrorHandler from './ErrorHandler';

//import * as JSONRefs from 'json-refs';
var JSONRefs = require('json-refs');

module jm.cli {
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
            resolution: Promise<JsonRefs.ResolvedRefsResults> = JSONRefs.resolveRefs(aJSObject, config),
            resolveJson: (aJsonRef: JsonRefs.ResolvedRefsResults) => Promise<Object> = (aJsonRef: JsonRefs.ResolvedRefsResults) => {
                return Promise.resolve(aJsonRef.resolved);
            };

        return resolution.then<Object>(resolveJson, ErrorHandler.setupPromiseErrorHandler(JOURNEYS_RESOLUTION_FAILED, aJSObject));
    }
}

export default jm.cli.JSONPropertyResolver;
