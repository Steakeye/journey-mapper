import { LinkItem } from './LinkItem'
import {unescape} from "querystring";

module jm.core {
    export interface StepConfig extends Item {
        //url: string;
        //answers?: string[];
        //headings?: string[];
    }

    export class Step extends LinkItem {
        private static MSG_INCORRECT_STATE: string = "Current state did not match expected state"

        constructor(aStep: StepConfig, private nav: NavigatorAdaptor, private errorHandler:BasicErrorHandler) {
            super(aStep);
        }

        public begin(aCurrentState: Promise<SQuery| JQuery>) : void {
            //TODO
            if (this.isExpectedState(undefined)) {
                this.interact(aCurrentState)
            } else {
                this.errorHandler(Step.MSG_INCORRECT_STATE);
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
    }
}
export = jm.core;