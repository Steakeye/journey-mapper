/*!
 * Selenium Query Library v0.50.34
 *
 * MIT license
 * http://opensource.org/licenses/MIT
 */
declare var _: any;
declare var _webdriver: any;
declare var dfr_run: any;
declare function each(arr: any, fn: any, ctx: any): any;
declare function map(arr: any, fn: any, ctx: any): any[];
declare function aggr(seed: any, arr: any, fn: any, ctx: any): any;
declare function indexOf(arr: any, fn: any, ctx: any): number;
declare var node_eval: any, node_evalGlobal: any, node_is: any;
declare var async_traverse: any, async_each: any, async_map: any, async_at: any, async_getValueOf: any, async_mutate: any, async_next: any, async_aggr: any, async_waterfall: any;
declare function scripts_nodeMatchesSelector(): any;
declare function scripts_nodeParent(): any;
declare function scripts_nodeClosest(): any;
declare function scripts_nodeChildren(): any[];
declare function scripts_nodeNext(): any;
declare function scripts_nodeRemove(): void;
declare function scripts_nodeAttribute(): any;
declare function scripts_nodeProperty(): any;
declare function scripts_nodeFunctionCall(): any;
declare function scripts_nodeDataset(): any;
declare function scripts_nodeSelectTextRange(): void;
declare function scripts_nodeSelectOption(): void;
declare function scripts_nodeClassAdd(): void;
declare function scripts_nodeClassRemove(): void;
declare function scripts_nodeClassToggle(): void;
declare function scripts_nodeClassHas(): any;
declare function scripts_nodeTrigger(): void;
declare function scripts_nodeCss(): string;
declare var SQueryProto: {
    length: number;
    constructor: (mix: any) => any;
};
declare var SQuery: any;
/*API
 ☰
 constructor

 Collection

 length
 eq
 slice
 each
 map
 toArray
 Traverse

 find
 filter
 children
 parent
 closest
 Attributes

 attr
 removeAttr
 prop
 removeProp
 val
 css
 Class

 hasClass
 addClass
 removeClass
 toggleClass
 Manipulate

 remove
 Dimension and Position

 height
 width
 innerHeight
 innerWidth
 offset
 position
 scrollTop
 scrollLeft
 Content

 html
 text
 append
 prepend
 before
 after
 Events

 trigger
 click
 change
 focus
 blur
 ✨ type
 ✨ press
 ✨ sendKeys
 ✨ select
 Misc

 eval
 Document

 load
 getDriver
 setDriver
 constructor(WebDriver|WebElement|Array<WebElement>|SQuery|Array<SQuery>)
 WebDriver
 WebElement
 var SQuery = require('selenium-query');
 var $elements = SQuery(driver);
 var $inputs = $elements.find('inputs');
 Collection
 length:number
 Count of WebElements in a current set.

 ❗️ Due to asynchronous nature, sometimes you have to wait until the promise is resolved to get the correct length value

 eq(index:number):SQuery
 Get the SQuery instance with only one element at the index.

 ❗️ Once again, wait until the promise is resolved, or chain the manipulations

 $(driver)
 .find('button')
 .eq(0)
 .css('background-color', 'red')
 .done(() => console.log('The color has been changed.'))
 // instead of an equivalent
 $(driver)
 .find('button')
 .done(buttons => {
 buttons
 .eq(0)
 .done(firstButton => {
 firstButton
 .css('background-color', 'red')
 .done(() => console.log('The color has been changed.'))
 })
 });
 slice([start:number = 0, end:number = .length]):SQuery
 Get elements range.

 each(function<node:WebElement, index:number, Promise|void 0>):SQuery
 Enumerate the collection. The callback function can return a promise, if an async job is performed.

 map(function<node:WebElement, index:number, Promise|any>):SQuery
 Map the collection into the new one. Return the value from the function or a promise which resolves then with the value.

 toArray():Promise<Array<any>>
 Returns a promise which resolves with an Array instance of current elements in collection

 Traverse
 find(selector:string):SQuery
 Find element(s).

 filter(selector:string):SQuery
 Filter element(s) out of the current collection.

 children([selector:string]):SQuery
 Get, and optionally filter, children of every element in the collection.

 parent():SQuery
 Get parent elements of every element in the collection

 closest(selector):SQuery
 Find ancestor of every element in the collection

 Attributes
 attr(key:string | key:string, val:any | attributes:Object ):SQuery|Promise<any>
 Get attribute value of the first element in the collection, or set attribute(s) to each element.

 removeAttr(key:string):SQuery
 Remove the attribute

 prop(key:string | key:string, val:any | properties:Object):SQuery|Promise<any>
 Get property value of the first element in the collection, or set property(ies) to each element.

 removeProp(key:string):SQuery
 Delete property

 val([value:string]):SQuery
 Get or set value property, like input.value

 css(key:string | key:string, val:string | css:Object ):SQuery|Promise<any>
 Get or set style properties

 Class
 hasClass(name:string):Promise<boolean>
 Check if the first element has the class name.

 addClass(name:string):SQuery
 Add the class name(s) to every element in the collection

 removeClass(name:string):SQuery
 Remove the class name(s) of every element in the collection

 toggleClass(name:string):SQuery
 Toggle the class name(s) of every element in the collection

 Manipulate
 remove():SQuery
 Remove the elements from the parent nodes

 Dimensions
 height():Promise<number>
 width():Promise<number>
 innerHeight():Promise<number>
 innerWidth():Promise<number>
 offset():Promise<object{top,left}>
 position():Promise<object{top,left}>
 scrollTop():Promise<number>
 scrollLeft():Promise<number>
 Content
 html([html:string]):SQuery|Promise<string>
 text([text:string]):SQuery|Promise<string>
 append(html:string):SQuery
 prepend(html:string):SQuery
 before(html:string):SQuery
 after(html:string):SQuery
 Events
 trigger(type:string [, data:Object]):SQuery
 Trigger native or custom event.

 click():SQuery
 change():SQuery
 Trigger change event ##### focus():SQuery ##### blur():SQuery

 type(text:string):SQuery
 Enter the text.

 ❗️ Meta keys are supported in {}

 press(combination:string):SQuery
 Press key combination. E.g.: ctrl+c, a+b+c, ctrl+alt+d, ctrl++ (control and plus keys)

 sendKeys(text:string):SQuery
 Call native Selenums sendKeys fn on each element

 select(text:string | start:number[, end:number]):SQuery
 Select an option from the select element, or if the input the selects a text or range

 Misc
 eval(fn:Function, ...args):Promise<any>
 Evaluate function in Browser.

 ❗️ The first argument is the first element in the set

 $(driver)
 .find('button')
 .eval(function(el){
 // browser context
 // do smth. with the Element and return a value
 });
 Document
 static load(url:string[, config:WebDriverOptions]):SQuery
 Create or reuse a WebDriver, and load the page.

 WebDriverOptions defaults
 {
 name: 'Chrome',
 args: ['no-sandbox'],
 binaryPath: null,

 // For better control and to change the behaviour of how the options are created and applied,
 // you can define next functions
 applyOptions: function(builder, options) {},
 setOptions (builder, options) {},
 setArguments (options) {},
 setBinaryPath (options) {},
 setLogging (options) {}
 }
 Example

 SQuery
 .load('http://google.com')
 .find('input')
 .css('background-color', 'red');*/