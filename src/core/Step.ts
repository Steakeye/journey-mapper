import { LinkItem } from './LinkItem'
import {unescape} from "querystring";

module jm.core {
    export interface StepConfig extends Item {
        actions?:string;
        validator?:string;
    }

    export class Step extends LinkItem {
        private static MSG_INCORRECT_STATE: string = "Current state did not match expected state";

        constructor(aStep: StepConfig, private nav: NavigatorAdaptor, private errorHandler:BasicErrorHandler) {
            super(aStep);

            this.build(aStep);
        }

        public begin(aCurrentState: SQuery| JQuery) : void {
            //TODO
            /*if (this.isExpectedState(aCurrentState)) {
                this.interact(aCurrentState)
            } else {
                this.errorHandler(Step.MSG_INCORRECT_STATE);
            }*/
            this.isExpectedState(aCurrentState).then((aExpected: boolean) => {
                this.interact(aCurrentState);
            },
            (aErr: string) => {
                this.errorHandler(aErr);
            });
        }

        private build(aStep: StepConfig): void {
            let path:string = aStep.actions;

            if (path) {
                this.interactor = require(path);
            }

            //Assign validator
            path = aStep.validator;
            this.validator = path ? require(path) : (aCurrentStep: Step, aCurrentState: SQuery| JQuery, aNavigator: NavigatorAdaptor) => true;
        }

        private isExpectedState(aCurrentState: SQuery| JQuery) : Promise<boolean> {
            return new Promise<boolean>((resolve : (value?: boolean) => void, reject: (error?: any) => void) => {
                let res = this.validator(this, aCurrentState, this.errorHandler);

                if (res !== undefined && !(res instanceof Promise)) {
                    if (res) {
                        resolve(res);
                    } else {
                        reject(Step.MSG_INCORRECT_STATE);
                    }
                } else {
                    (<Promise<boolean>>res).then(resolve, reject);
                }
            });
        }

        private interact(aState: SQuery| JQuery) : void {
            //TODO
            this.interactor(this, aState, this.errorHandler);
        }

        private interactor: (aCurrentStep: Step, aCurrentState: SQuery| JQuery, aErrHandler: BasicErrorHandler) => void;
        private validator?: (aCurrentStep: Step, aCurrentState: SQuery| JQuery, aErrHandler: BasicErrorHandler) => boolean | Promise<boolean>;
    }
}
export = jm.core;