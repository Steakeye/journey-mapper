declare module getUrls {
    interface URLOptions {
        normalizeProtocol: boolean;
        normalizeHttps: boolean;
        stripFragment: boolean;
        stripWWW: boolean;
        removeQueryParameters: Array<RegExp|string>;
        removeTrailingSlash: boolean;
        removeDirectoryIndex: boolean | Array<RegExp|string>;
    }

    interface getUrls {
        (string: string, options?: getUrls.URLOptions): Set<string>;
    }
}

declare module "get-urls" {

    //import * as Set from 'Set';
    var getUrls:getUrls.getUrls;

    export = getUrls;
}