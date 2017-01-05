import { LinkItem } from './LinkItem'

module jm.core {
    export interface StepConfig extends Item {
        //url: string;
        //answers?: string[];
        //headings?: string[];
    }

    export class Step extends LinkItem {
        constructor(page: StepConfig) {
            super(page);

            for (let p in page) {
                this[p] = page[p];
            }
        }
    }
}

export = jm.core;