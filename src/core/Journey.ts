import { IJourney } from '../interfaces/IJourney';
import { IPage } from '../interfaces/IPage';
import { Link } from './Link'
import { Page } from './Page'

module jm.core {
    export interface JourneyConfig {
        [index: string]: any;
        id: string;
        description: string;
        archive: string;
        thumbnails: string[];
        pages: Page[];
        modules: string[];
    }

    export class Journey extends Link {
        constructor(journey: JourneyConfig) {
            super();

            for (let prop in journey) {
                let journeyProperty = journey[prop];

                if (prop === 'pages') {
                    for (let page in journey.pages) {
                        this.pages.push(new Page(<IPage>journey.pages[page]));
                    }

                } else {
                    this[prop] = journeyProperty;
                }
            }
        }

        private pages: Page[];
        private : Page[];
    }
}

export = jm.core;