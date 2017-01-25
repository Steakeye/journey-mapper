///<reference path="../core/Journey.ts"/>

interface ModernArray<T> extends Array<T> {
    includes(aVal:T): boolean;
}

interface ItemConfig {
    id: string;
    title: string;
    description?: string;
}

interface Item extends ItemConfig {
    assignMembers(aProperties: ItemConfig): void;
}

interface TaskProto {
    started: boolean;
    complete: boolean;
    succeeded: boolean;
}

interface ActionableTask extends TaskProto {
    begin(): Promise<ActionableTask>
}

interface ValueDTO {
    name: string;
    value: any;
}

interface ImageDTO extends ValueDTO {
    value: string;
}

interface TaskDTO extends ItemConfig, TaskProto {

}

interface StepDTO extends TaskDTO {
    parentID?: string;
    screenShots: ImageDTO[]
}

interface JourneyDTO extends TaskDTO {
    steps: StepDTO[];
}

interface BasicErrorHandler {
    (aError: string | Error): void
}

type PromiseResolveCB<T, U> = (aValue?: T) => U | Thenable<U>;

type PromiseRejectCB<T> = (aError?: T) => void;

type DeferredQuery = SQuery| JQuery;

interface NavigatorAdaptor {
    query: DeferredQuery
    goTo(aUrl: string): Promise<DeferredQuery>;
    takeScreenShot(): Promise<string>;
    getCurrentUrl(): Promise<string>;
    getCurrentHTML(aQueryEl?: DeferredQuery): Promise<string>;
    sendKey(aQueryEl: DeferredQuery, aKeyToSend: string): Promise<boolean>}

interface AssetAdaptor {
    saveScreenShots<JourneyDTO>(aJourney: JourneyDTO): Promise<string[]>
    saveCurrentAssets(aStep: StepDTO, aNav: NavigatorAdaptor, aState?: DeferredQuery): Promise<boolean>
}