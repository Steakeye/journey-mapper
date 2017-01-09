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

/*interface NavGoToCallback {
    (aUrl: string, aOnUrl?: (aSuccess: boolean) => void): void;
}
interface NavGoToPromise<T> {
    <T>(aUrl: string): Promise<T>;
}*/

interface NavigatorAdaptor {
    goTo(aUrl: string): Promise<SQuery| JQuery>;
}