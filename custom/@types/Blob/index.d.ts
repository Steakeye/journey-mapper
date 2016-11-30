// Type definitions for ./libs/html5/Blob.js
// Project: [LIBRARY_URL_HERE] 
// Definitions by: Matt Pepper <https://github.com/mattpepper>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
// URL.!ret

/**
 * 
 */
declare interface Ret {
}
// Blob.!1

/**
 * 
 */
declare interface FakeBlob {
		
	/**
	 * 
	 */
	data : string;
		
	/**
	 * 
	 */
	size : number;
		
	/**
	 * 
	 */
	type : string;
		
	/**
	 * 
	 */
	encoding : string;
}

/**
 * 
 */
declare interface URL {
		
	/**
	 * 
	 * @param uri 
	 * @return  
	 */
	new (uri : any): Ret;
}


/**
 * 
 */
declare interface Blob {
		
	/**
	 * 
	 * @param blobParts 
	 * @param options 
	 * @return  
	 */
	new (blobParts : any, options : 1): /* Blob.!1 */ any;
}


/**
 * 
 * @param blob 
 * @return  
 */
declare function createObjectURL(blob : any): string;

/**
 * 
 * @param object_URL 
 */
declare function revokeObjectURL(object_URL : any): void;
