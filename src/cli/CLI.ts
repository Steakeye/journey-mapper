/**
 * Created by steakeye on 07/12/16.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as argumentParser from 'commander';
import ErrorHandler from '../core/ErrorHandler';
import { IJourneys } from '../interfaces/IJourney';

/*import FileConverter from './m2n/FileConverter';
import {FormatTranslator, ExternalConversion} from './m2n/FormatTranslator';
import {PathMapper, MappingPair} from './m2n/PathMapper';*/

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

        private static SOURCE_PATH_NOT_FOUND: string = "Source path not found";
        private static OUTPUT_PATH_NOT_SPECIFIED: string = "Output path not specified";
        private static CONFIG_PATH_NOT_FOUND: string = "Config path not found";

        constructor(cliArgs: string[]) {
            let sourcePath: string,
                outputPath: string,
                configPath: string;

            // console.log("CLI");
            // console.log(arguments);

            //Set up the CLI interface then process the arguments in order to get the data/instructions
            argumentParser.version('0.0.1')
                .option('-J, --journey [path]', 'JSON file describing the journeys')
                .option('-O, --output [path]', 'Location to save the packaged journeys')
                .option('-C, --config [path]', 'Location of json config file to load. Defaults to jmconfig.json in root', CLI.DEFAULT_CONFIG_PATH)
                .parse(cliArgs);

            //let CLI:CLI = new CLI((<any>cliArgs).source, (<any>cliArgs).output, (<any>cliArgs).config);

            sourcePath = (<any>argumentParser).journey;
            outputPath = (<any>argumentParser).output;
            configPath = (<any>argumentParser).config;

            if (!outputPath) { //undefined or empty string
                //this.assignSourceToBothPaths(sourcePath)
                ErrorHandler(CLI.OUTPUT_PATH_NOT_SPECIFIED);
            } else {
                this.assignPathValues(sourcePath, outputPath);
            }
            this.setOutputType();

            this.tryToLoadConfig(configPath);
        }

/*        public convertFiles(): void {
            let fileConverter: FileConverter,
                pathMapper: PathMapper,
                fileMappings: MappingPair[];

            function convert(aFrom: string, aTo: string) {
                fileConverter = new FileConverter(aFrom, aTo, new FormatTranslator());
                fileConverter.convert();
            }

            if (this.outputType === OutputType.FILE) {
                //Just use the file converter on one source
                convert(this.sourcePath, this.outputPath);
            } else {
                //Assume is directory
                //Get all the files in the directory
                pathMapper = new PathMapper(this.sourcePath, this.outputPath);
                //Create mappings to desitnations
                fileMappings = pathMapper.generatePaths();
                //Iterate over list of files, converting one by one
                fileMappings.forEach((aMapping: MappingPair) => {
                    convert(aMapping.from, aMapping.to);
                });
            }
        }*/

        private sourcePath: string;
        private outputPath: string;
        private outputType: OutputType;
        private customConfig: Config;

        private tryToLoadConfig(aConfigPath: string): void {
            let resolvedPath: PathResolution = this.resolveAndValidatePath(aConfigPath);
            /*,
             configJson:Config;*/

            if (resolvedPath.valid) {
                try {
                    this.customConfig = require(resolvedPath.path);
                } catch (aErr) {
                    this.exitWithError(aErr);
                }
            } else if (resolvedPath.path !== CLI.DEFAULT_CONFIG_PATH) {
                this.exitWithError(CLI.CONFIG_PATH_NOT_FOUND);
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
                this.exitWithError(CLI.SOURCE_PATH_NOT_FOUND);
            }

            return resolvedPath.path;
        }

        private setOutputType(): void {
            this.outputType = fs.statSync(this.sourcePath).isFile() ? OutputType.FILE : OutputType.FOLDER;
        }

        private exitWithError(aError: string): void {
            console.error(aError)
            process.exit(1);
        }

    }
}

export = cli.CLI;
