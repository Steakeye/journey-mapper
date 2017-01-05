interface Item {
    id: string;
    title: string;
    description?: string;
}

interface NavigatorAdaptor {
    goTo(aUrl: string, aOnUrl: (aSuccess: boolean) => void): void;
}