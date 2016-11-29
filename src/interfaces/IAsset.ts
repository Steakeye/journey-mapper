interface IAssets {
    assets: IAsset[]
}

interface IAsset {
     download: string;
     zip     : string;
     fileType: string;
     complete: boolean
}

