import { IPage } from '../interfaces/IPage'

class Page implements IPage {
    [index: string]: string;
    key: string;
    description: string;
    url: string;

    constructor(page: IPage) {
        for(let p in page) {
            this[p] = page[p];
        }
    }
}

export { Page }