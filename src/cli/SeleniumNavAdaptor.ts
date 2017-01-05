///<reference path="../interfaces/core.d.ts" />

module jm.cli {
    export class SeleniumNavAdaptor implements NavigatorAdaptor {

        public goTo(aUrl: string, aOnUrl: (aSuccess: boolean) => void): void {

        }
    }
}

export default jm.cli.SeleniumNavAdaptor;
