interface Item {
    id: string;
    title: string;
    description?: string;
}

/*interface NavGoToCallback {
    (aUrl: string, aOnUrl?: (aSuccess: boolean) => void): void;
}
interface NavGoToPromise<T> {
    <T>(aUrl: string): Promise<T>;
}*/

interface NavigatorAdaptor {
    goTo(aUrl: string): Promise<SQuery| JQuery>;
}