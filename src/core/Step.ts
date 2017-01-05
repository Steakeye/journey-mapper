
module jm.core {
    export interface StepConfig {
        key: string;
        description: string;
        url: string;
        answers?: string[];
        headings?: string[];
    }

    export class Step {
        [index: string]: string;
        key: string;
        description: string;
        url: string;

        constructor(page: StepConfig) {
            for (let p in page) {
                this[p] = page[p];
            }
        }
    }
}

export = jm.core;