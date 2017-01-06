/**
 * Created by steakeye on 06/01/17.
 */
module jm.core_utils {

    export module Obj {
        export function applyPropertiesFromSourceToTarget(aProperties: string[], aSource: {}, aTarget: {}, aAugmenter?:(aKey: string, aValue: any, atarget: {}) => void): void {
            if (aProperties) {
                aProperties.forEach((aKey: string) => {
                    let sourceProp: any;

                    if (aKey && ((sourceProp = aSource[aKey]) !== undefined)) {
                        if (aAugmenter) {
                            aAugmenter(aKey, sourceProp, aTarget);
                        } else {
                            aTarget[aKey] = sourceProp;
                        }
                    }
                })
            }
        }
    }
}

export = jm.core_utils.Obj;