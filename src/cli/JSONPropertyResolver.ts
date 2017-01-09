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

    type ObjOrArr = {} | any[];

    const JSON_RESOLUTION_FAILED: string = "JSON references failed to be resolved.";
    const SPECIAL_CASE_KEYS: string[] = ['actions', 'validator'];

    function reMapModulePaths(aModuleMap:{ [pointer:string]: string}, aJSObject: Object): Object {
        let pointers: string[] = Object.keys(aModuleMap);

        pointers.forEach((aKey: string) => {
            let pathToProp: string[] = JSONRefs.pathFromPtr(aKey),
                lastObj: ObjOrArr,
                pathLength:number = pathToProp.length,
                pathIndex: number = 0,
                nextObj:ObjOrArr = aJSObject;

            while((pathIndex < pathIndex)){
                lastObj = nextObj;
                nextObj = lastObj[pathToProp[pathIndex]];
                ++pathIndex;
            }

        })

        return aJSObject;
    }

    function getLastKeyInPathIfSpecial(aFragmentedPath:string[]): string {
        let lastPathKey:string = aFragmentedPath[aFragmentedPath.length - 1];
        return SPECIAL_CASE_KEYS.indexOf(lastPathKey) > -1 ? lastPathKey: undefined;
    }

    function excludeSpecialPaths(obj: JsonRefs.UnresolvedRefDetails, refPath: string[]): boolean {
        return !getLastKeyInPathIfSpecial(refPath);
    }

    export function JSONPropertyResolver(aJSObject: Object, aBasePath: string): Promise<Object> {
        function processor(obj: { $ref: string }, refPath: string[]) {
            let objToReturn:{ $ref: string } | { _$ref: string },
                lastPathKey:string = getLastKeyInPathIfSpecial(refPath);
            console.log('refPreProcessor');
            console.log(path.resolve(this.relativeBase, obj.$ref));

            if (lastPathKey) {
                console.log('found: ', lastPathKey);
                moduleTable[JSONRefs.pathToPtr(refPath)] = path.resolve(this.relativeBase, obj.$ref);
                //objToReturn = require(path.resolve(this.relativeBase, obj.$ref));
                //obj.$ref = path.resolve(this.relativeBase, obj.$ref);
                //obj._$ref = path.resolve(this.relativeBase, obj.$ref);
                //obj.$ref = undefined;
                objToReturn = { _$ref: path.resolve(this.relativeBase, obj.$ref) };
            } else {
                objToReturn = obj;
            }

            return objToReturn;
        }
        /*function postProcessor(obj: JsonRefs.UnresolvedRefDetails, refPath: string[]) {
            var objToReturn;
            console.log('postProcessor');

            if (typeof obj.def == 'function') {
                console.log('we found a cheeky non json function');
                objToReturn = obj.def;
            }
            else {
                objToReturn = obj;
            }
            return objToReturn;
        }
*/
        let moduleTable = {},
            errorHandler = ErrorHandler.setupPromiseErrorHandler(JSON_RESOLUTION_FAILED, aJSObject),
            config:JsonRefs.JsonRefsOptions = {
                relativeBase: aBasePath,
                includeInvalid: true,
                //filter: refFilter
                filter: excludeSpecialPaths,
                refPreProcessor: processor//,
                //refPostProcessor: postProcessor
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
                    return Promise.resolve(reMapModulePaths(moduleTable, aJsonRef.resolved));
                }

            };

        return resolution.then<Object>(resolveJson, errorHandler);
    }
}

export default jm.cli.JSONPropertyResolver;
