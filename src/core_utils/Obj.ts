/**
 * Created by steakeye on 06/01/17.
 */
module jm.core_utils {

    export module Obj {
        export function applyPropertiesFromSourceToTarget(aProperties: string[], aSource: {}, aTarget: {}): void {
            if (aProperties) {
                aProperties.forEach((aKey: string) => {
                    let sourceProp: any;

                    if (aKey && ((sourceProp = aSource[aKey]) !== undefined)) {
                        aTarget[aKey] = sourceProp;
                    }
                })
            }
        }
    }
}

export = jm.core_utils.Obj;