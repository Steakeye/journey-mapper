import { IJourney } from '../interfaces/IJourney';
import { IPage } from '../interfaces/IPage';
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

    export class Journey {
        constructor(journey: JourneyConfig) {
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
    }
}

export = jm.core;