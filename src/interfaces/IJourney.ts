import { IPage } from './IPage'

interface IJourneys {
    journeys: IJourney[]
}

interface IJourney {
    [index: string]: any;
    id: string;
    description: string;
    archive: string;
    thumbnails: string[];
    pages: IPage[];
    modules: string[];
}

export { IJourneys, IJourney }