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
    getCurrentUrl(): Promise<string>;
    takeScreenShot(): Promise<string>;
    sendKey(aQueryEl: DeferredQuery, aKeyToSend: string): Promise<boolean>}

interface AssetAdaptor<JourneyDTO> {
    saveScreenShots<JourneyDTO>(aJourney: JourneyDTO): Promise<string[]>
}