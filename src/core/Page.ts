
module jm.core {
    export interface PageConfig {
        key: string;
        description: string;
        url: string;
        answers?: string[];
        headings?: string[];
    }

    export class Page {
        [index: string]: string;
        key: string;
        description: string;
        url: string;

        constructor(page: PageConfig) {
            for (let p in page) {
                this[p] = page[p];
            }
        }
    }
}

export = jm.core;