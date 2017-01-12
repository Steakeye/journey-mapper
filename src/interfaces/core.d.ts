interface ModernArray<T> extends Array<T> {
    includes(aVal:T): boolean;
}

interface Item {
    id: string;
    title: string;
    description?: string;
}

interface ItemClass extends Item {
    assignMembers(aProperties: Item): void;
}

interface BasicErrorHandler {
    (aError: string | Error): void
}

type DeferredQuery = SQuery| JQuery;

interface NavigatorAdaptor {
    query: DeferredQuery
    goTo(aUrl: string): Promise<DeferredQuery>;
    getCurrentUrl(): Promise<string>;
    takeScreenshot(): Promise<string>;
}

interface AssetAdaptor {}