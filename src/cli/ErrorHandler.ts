
module jm.cli {
    export function ErrorHandler(aError: string | Error): void {
        console.error(aError)
        process.exit(1);
    }
}

export default jm.cli.ErrorHandler;
