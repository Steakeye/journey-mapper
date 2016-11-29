import { IJourneys, IJourney } from '../interfaces/IJourney';
import { Journey } from '../core/Journey'

class PluginApp implements IJourneys {
    journeys: Journey[];

    constructor(fileList?: FileList, file?: File) {
        let fileArray = new Array<File>();
        let counter: number = 0;

        if (fileList) {
            for (; counter < fileList.length; counter++) {
                fileArray.push(fileList.item(counter));
            }
        }
        else {
            fileArray.push(file);
        }
    }

    getJourneys (configs: Object[]) {
        let j = 0;
        let jLength = configs.length;

        for (;j < jLength; j++) {
            let config = configs[j];
            this.journeys.push(new Journey(<IJourney>config));
        }
    }
}