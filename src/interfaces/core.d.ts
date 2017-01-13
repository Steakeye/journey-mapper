interface ModernArray<T> extends Array<T> {
    includes(aVal:T): boolean;
}

interface ItemConfig {
    id: string;
    title: string;
    description?: string;
}

interface Item extends ItemConfig {
    assignMembers(aProperties: ItemConfig): void;
}

interface Task {
    complete: boolean;
    succeeded: boolean;
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