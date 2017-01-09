///<reference path="../../typings/index.d.ts" />

import * as path from 'path';
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
    const SPECIAL_CASE_ACTIONS: string = "actions";

    export function JSONPropertyResolver(aJSObject: Object, aBasePath: string): Promise<Object> {
        function processor(obj: { $ref: string }, refPath: string[]) {
            console.log('refPreProcessor');
            console.log(path.resolve(this.relativeBase, obj.$ref));

            if(refPath[refPath.length - 1] === SPECIAL_CASE_ACTIONS) {
                console.log('we found an action');
            }

            return obj;
        }

        let errorHandler = ErrorHandler.setupPromiseErrorHandler(JOURNEYS_RESOLUTION_FAILED, aJSObject),
            config:JsonRefs.JsonRefsOptions = {
                relativeBase: aBasePath,
                refPreProcessor: processor
            },
            resolution: Promise<JsonRefs.ResolvedRefsResults> = JSONRefs.resolveRefs(aJSObject, config),
            resolveJson: (aJsonRef: JsonRefs.ResolvedRefsResults) => Promise<Object> = (aJsonRef: JsonRefs.ResolvedRefsResults) => {
                const jsonRefs:{ [JSONPointer: string]: JsonRefs.ResolvedRefDetails } = aJsonRef.refs;
                let errors: string[] = Object.keys(jsonRefs).map((aValue) => {
                    let error: string = jsonRefs[aValue].error;
                    if (error) {
                        return aValue + ' ' + error;
                    }
                }).filter((aErrorMessage: string) => {
                    return  !!aErrorMessage;
                });
                if (errors.length) {
                    return errorHandler(new Error(errors[0]));
                } else {
                    return Promise.resolve(aJsonRef.resolved);
                }

            };

        return resolution.then<Object>(resolveJson, errorHandler);
    }
}

export default jm.cli.JSONPropertyResolver;
