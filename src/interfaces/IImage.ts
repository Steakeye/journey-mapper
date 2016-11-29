interface IImage {
    key: string;
    zip: string;
    height: number;
    width: number;
}
interface ISnapshots {
    items: ISnapshot[]
}

interface ISnapshot extends IImage {
}

interface IThumbnails {
    items: IThumbnails[]
}

interface IThumbnail extends IImage {
}
