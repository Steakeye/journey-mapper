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
    const PATH_EMPTY_JSON: string = process.cwd() + '/resources/empty.json';
    const SPECIAL_CASE_KEYS: string[] = ['actions', 'validator'];

    function reMapModulePaths(aProcessedJson:JsonRefs.ResolvedRefsResults): Object {
        let resovedJson = aProcessedJson.resolved,
            refs: { [JSONPointer: string]: JsonRefs.ResolvedRefDetails } = aProcessedJson.refs,
            pointers: string[] = Object.keys(refs).filter((aPointer:string) => {
                return !!(<{ _$ref: string; }>refs[aPointer].def)._$ref;
            });

        pointers.forEach((aKey: string) => {
            let pathToProp: string[] = JSONRefs.pathFromPtr(aKey),
                lastObj: ObjOrArr,
                pathLength:number = pathToProp.length,
                pathIndex: number = 0,
                nextObj:ObjOrArr = resovedJson,
                nextKey: string;

            while((pathIndex < pathLength)){
                lastObj = nextObj;
                nextKey = pathToProp[pathIndex];
                nextObj = lastObj[nextKey];
                ++pathIndex;
            }

            //Now we've got hold of the right object to rectify,
            //we can add the new ref object that has the absolute path to the module
            lastObj[nextKey] = (<{ _$ref: string; }>refs[aKey].def)._$ref;

        });

        return resovedJson;
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
            //console.log('refPreProcessor');

            if (lastPathKey) {
                //console.log('found: ', lastPathKey);
                objToReturn = { _$ref: path.resolve(this.relativeBase, obj.$ref), $ref: path.relative(this.relativeBase, PATH_EMPTY_JSON) };
            } else {
                objToReturn = obj;
            }

            return objToReturn;
        }

        let errorHandler = ErrorHandler.setupPromiseErrorHandler(JSON_RESOLUTION_FAILED, aJSObject),
            config:JsonRefs.JsonRefsOptions = {
                relativeBase: aBasePath,
                includeInvalid: true,
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
                    return Promise.resolve(reMapModulePaths(aJsonRef));
                }

            };

        return resolution.then<Object>(resolveJson, errorHandler);
    }
}

export default jm.cli.JSONPropertyResolver;
