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
            if (this.isExpectedState(aCurrentState)) {
                this.interact(aCurrentState)
            } else {
                this.errorHandler(Step.MSG_INCORRECT_STATE);
            }
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

        private isExpectedState(aCurrentState: SQuery| JQuery) : boolean {
            //TODO
            return this.validator(this, aCurrentState, this.errorHandler);
        }

        private interact(aState: SQuery| JQuery) : void {
            //TODO
            this.interactor(this, aState, this.errorHandler);
        }

        private interactor: (aCurrentStep: Step, aCurrentState: SQuery| JQuery, aErrHandler: BasicErrorHandler) => void;
        private validator?: (aCurrentStep: Step, aCurrentState: SQuery| JQuery, aErrHandler: BasicErrorHandler) => boolean;
    }
}
export = jm.core;