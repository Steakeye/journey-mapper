/**
 * Created by steakeye on 07/12/16.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as argumentParser from 'commander';
import ErrorHandler from './ErrorHandler';
import JSONLoader from './JSONLoader';
import JSONPropertyResolver from './JSONPropertyResolver';
import NavAdaptor from './SeleniumNavAdaptor';
import AssetAdaptor from './NodeAssetAdaptor';
import { IJourneys } from '../interfaces/IJourney';
import { Journeys, JourneysConfig } from '../core/Journeys';

enum OutputType {
    FILE,
    FOLDER
}

interface PathResolution {
    path: string;
    valid: boolean;
}

interface Config extends IJourneys {
}

module cli {
    export class CLI {
        public static DEFAULT_CONFIG_PATH: string = process.cwd() + '/jmnconfig.json';

        private static JOURNEYS_FILE_ERROR: string = "Please provide a location from which to load journeys json.";
        private static JOURNEYS_PATH_NOT_SPECIFIED: string = "Journeys path not specifed. " + CLI.JOURNEYS_FILE_ERROR;
        private static JOURNEYS_FILE_NOT_FOUND: string = "Journeys JSON not found. " + CLI.JOURNEYS_FILE_ERROR;
        private static OUTPUT_PATH_NOT_SPECIFIED: string = "Output path not specified. Please specify a location to save mapped journeys.";
        private static CONFIG_PATH_NOT_FOUND: string = "Config path not found";

        constructor(cliArgs: string[]) {
            let journeysPath: string,
                outputPath: string,
                configPath: string,
                journey;

            // console.log("CLI");
            // console.log(arguments);

            //Set up the CLI interface then process the arguments in order to get the data/instructions
            argumentParser.version('0.0.1')
                .option('-J, --journeys [path]', 'JSON file describing the journeys')
                .option('-O, --output [path]', 'Location to save the packaged journeys')
                .option('-C, --config [path]', 'Location of json config file to load. Defaults to jmconfig.json in root', CLI.DEFAULT_CONFIG_PATH)
                .parse(cliArgs);

            journeysPath = (<any>argumentParser).journeys;
            outputPath = (<any>argumentParser).output;
            configPath = (<any>argumentParser).config;

            //TODO: Get config to establish  outpus path and journeys path
            this.tryToLoadConfig(configPath);

            if (!outputPath) { //undefined or empty string
                //this.assignSourceToBothPaths(journeysPath)
                ErrorHandler(CLI.OUTPUT_PATH_NOT_SPECIFIED);
            } else if (!journeysPath) { //undefined or empty string
                //this.assignSourceToBothPaths(journeysPath)
                ErrorHandler(CLI.JOURNEYS_PATH_NOT_SPECIFIED);
            } else {
                this.assignPathValues(journeysPath, outputPath);
            }

            this.setOutputType();

            this.loadJourneysJSON()
                .then(this.setupJourneysJSONParser(this.sourcePath))
                .then(this.buildJourneys)
                .then(this.startJourneys);

        }

        private sourcePath: string;
        private outputPath: string;
        private outputType: OutputType;
        private customConfig: Config;

        private tryToLoadConfig(aConfigPath: string): void {
            let resolvedPath: PathResolution = this.resolveAndValidatePath(aConfigPath);

            if (resolvedPath.valid) {
                try {
                    this.customConfig = require(resolvedPath.path);
                } catch (aErr) {
                    ErrorHandler(aErr);
                }
            } else if (resolvedPath.path !== CLI.DEFAULT_CONFIG_PATH) {
                ErrorHandler(CLI.CONFIG_PATH_NOT_FOUND);
            }
        }

        private resolveAndValidatePath(aPathToResolve: string): PathResolution {
            let resolvedSource: string = path.resolve(aPathToResolve);

            return {
                path: resolvedSource,
                valid: fs.existsSync(resolvedSource)
            };
        }

        private resolveAndAssignSource(aPath: string): string {
            return (this.sourcePath = this.resolveAndValidateSourcePath(aPath));
        }

        private assignSourceToBothPaths(aPath: string): void {
            this.outputPath = this.resolveAndAssignSource(aPath);
        }

        private assignPathValues(aSourcePath: string, aTargetPath: string): void {
            this.resolveAndAssignSource(aSourcePath);
            this.outputPath = path.resolve(aTargetPath);
        }

        private resolveAndValidateSourcePath(aPath: string): string {
            let resolvedPath: PathResolution = this.resolveAndValidatePath(aPath)

            if (!resolvedPath.valid) {
                ErrorHandler(CLI.JOURNEYS_FILE_NOT_FOUND);
            }

            return resolvedPath.path;
        }

        private setOutputType(): void {
            this.outputType = fs.statSync(this.sourcePath).isFile() ? OutputType.FILE : OutputType.FOLDER;
        }

        private loadJourneysJSON(): Promise<Object> {
            return JSONLoader(this.sourcePath);
        }

        private setupJourneysJSONParser(aJSONPath: string): (aJourneysObj: Object) => Promise<Object> {
            return (aJourneysObj: Object) => {
                return JSONPropertyResolver(aJourneysObj, path.parse(aJSONPath).dir);
            }
        }

        private buildJourneys(aJourneysConf: JourneysConfig): Promise<Journeys> {
            //console.log('buildJourneys');
            let journeys = new Journeys(ErrorHandler, new NavAdaptor, new AssetAdaptor);

            journeys.build(aJourneysConf);

            //return Promise.resolve(aJourneysObj);
            return Promise.resolve(journeys);
        }

        private startJourneys(aJourneysObj: Journeys): Promise<Journeys> {
            aJourneysObj.begin();

            return Promise.resolve(aJourneysObj);
        }

        private setupErrorHandler(aMessage: string): (aError: Error) => void {
            return (aError: Error) => {
                ErrorHandler(aMessage + aError);
            }
        }
    }
}

export = cli.CLI;
