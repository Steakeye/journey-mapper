import { LinkItem } from './LinkItem'

module jm.core {
    export interface StepConfig extends Item {
        //url: string;
        //answers?: string[];
        //headings?: string[];
    }

    export class Step extends LinkItem {
        constructor(aStep: StepConfig) {
            super(aStep);
        }
    }
}
export = jm.core;