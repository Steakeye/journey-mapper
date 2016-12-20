
module jm.cli {
    export function ErrorHandler(aError: string | Error): void {
        console.error(aError)
        process.exit(1);
    }

    export module ErrorHandler {
        export function setupErrorHandler(aMessage: string): (aError: Error) => void {
            return (aError: Error) => {
                ErrorHandler(aMessage + aError);
            }
        }
        export function setupPromiseErrorHandler<T>(aMessage: string, aValue:T): (aError: Error) => Promise<T> {
            return (aError: Error): Promise<T> => {
                ErrorHandler(aMessage + aError);
                return Promise.reject(aValue);
            }
        }
    }
}

export default jm.cli.ErrorHandler;
