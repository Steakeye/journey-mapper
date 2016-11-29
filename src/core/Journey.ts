import { IJourney } from '../interfaces/IJourney';
import { IPage } from '../interfaces/IPage';
import { Page } from './Page'

class Journey implements IJourney {
    [index: string]: any;
    id: string;
    description: string;
    archive: string;
    thumbnails: string[];
    pages: Page[];
    modules: string[];

    constructor(journey: IJourney) {
        for(let prop in journey) {
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
}

export { Journey, Page }