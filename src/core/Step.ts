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

        public begin(aCurrentState: Promise<SQuery| JQuery>) : void {
            //TODO
            if (this.isExpectedState(undefined)) {
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

            path = aStep.validator;

            if (path) {
                this.validator = require(path);
            }

        }

        private isExpectedState(aCurrentState: SQuery| JQuery) : boolean {
            //TODO
            return true;
        }

        private interact(aState: SQuery| JQuery) : void {
            //TODO
            this.interactor(aState, this.nav);
        }

        private interactor: (aCurrentState: SQuery| JQuery, aNavigator: NavigatorAdaptor) => void;
        private validator?: (aCurrentState: SQuery| JQuery, aNavigator: NavigatorAdaptor) => boolean;
    }
}
export = jm.core;