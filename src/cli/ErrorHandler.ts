
module jm.cli {
    export function ErrorHandler(aError: string): void {
        console.error(aError)
        process.exit(1);
    }
}

export default jm.cli.ErrorHandler;
