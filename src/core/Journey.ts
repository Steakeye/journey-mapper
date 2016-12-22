import { IJourney } from '../interfaces/IJourney';
import { Link } from './Link'
import { Page, PageConfig } from './Page'

module jm.core {
    export interface JourneyConfig {
        [index: string]: any;
        id: string;
        title: string;
        description: string;
        archive: string;
        thumbnails: string[];
        pages: PageConfig[];
        modules: string[];
    }

    export class Journey extends Link {
        constructor(aJourney: JourneyConfig) {
            super();

            for (let prop in aJourney) {
                let journeyProperty = aJourney[prop];

                if (prop === 'pages') {
                    for (let page in aJourney.pages) {
                        this.pages.push(new Page(<PageConfig>aJourney.pages[page]));
                    }

                } else {
                    this[prop] = journeyProperty;
                }
            }
        }

        private pages: Page[];
        private : Page[];

        private assignMembers(): void {

        }

        private buildPages(): void {

        }
    }
}

export = jm.core;