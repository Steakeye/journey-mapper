/*!
 * Selenium Query Library v0.50.34
 *
 * MIT license
 * http://opensource.org/licenses/MIT
 */

'use strict';


// source /src/index.es6
"use strict";

var _ = require("atma-utils");
var _webdriver = require("selenium-webdriver");

// source utils/dfr.es6
"use strict";

var dfr_run;
(function () {
	dfr_run = function (fn) {
		return _.class_Dfr.run(fn);
	};
})();
//# sourceMappingURL=dfr.es6.map
// end:source utils/dfr.es6
// source utils/arr.es6
"use strict";

function each(arr, fn, ctx) {
	if (arr == null) {
		return ctx || arr;
	}var imax = arr.length,
	    i = -1;
	while (++i < imax) {
		fn.call(ctx || arr, arr[i], i);
	}
	return ctx || arr;
}
function map(arr, fn, ctx) {
	var out = [];
	each(arr, function (x, i) {
		out.push(fn(x, i));
	});
	return out;
}
function aggr(seed, arr, fn, ctx) {
	each(arr, function (x, i) {
		seed = fn.call(ctx || arr, seed, arr[i], i);
	});
	return seed;
}
function indexOf(arr, fn, ctx) {
	if (arr == null) {
		return -1;
	}var imax = arr.length,
	    i = -1;
	while (++i < imax) {
		if (fn.call(ctx || arr, arr[i], i) === true) {
			return i;
		}
	}
	return -1;
}
//# sourceMappingURL=arr.es6.map
// end:source utils/arr.es6
// source utils/node.es6
"use strict";

var node_eval, node_evalGlobal, node_is;
(function () {
	node_eval = function (node, mix) {
		for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
			args[_key - 2] = arguments[_key];
		}

		return dfr_run(function (resolve) {
			var _getDriver;

			if (node instanceof _webdriver.WebDriver) {
				// Selenium can not run scripts with WebDriver context
				resolve();
				return;
			}

			var script = toScript(mix);
			var driver = getDriver(node);
			(_getDriver = getDriver(node)).executeScript.apply(_getDriver, [script, node].concat(args)).then(resolve, function (error) {
				console.error("Unexpected browser error", error);
				resolve();
			});
		});
	};
	node_evalGlobal = function (mix) {
		for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			args[_key - 1] = arguments[_key];
		}

		return dfr_run(function (resolve) {
			var _webdriver2;

			var script = toScript(mix);

			(_webdriver2 = _webdriver).executeScript.apply(_webdriver2, [script].concat(args)).then(resolve, function (error) {
				console.error("Unexpected browser error", error);
				resolve();
			});
		});
	};

	function getDriver(node) {
		if (node.executeScript) {
			return node;
		}
		if (node.getDriver) {
			return node.getDriver();
		}
		return node.driver_;
	}

	function toScript(mix) {
		if (typeof mix === "string") {
			return mix;
		}
		var script = mix.toString();
		script = script.substring(script.indexOf("{") + 1);
		script = script.substring(0, script.lastIndexOf("}") - 1);
		script = script.trim();
		return script;
	}
})();
//# sourceMappingURL=node.es6.map
// end:source utils/node.es6
// source utils/async.es6
"use strict";

var async_traverse, async_each, async_map, async_at, async_getValueOf, async_mutate, async_next, async_aggr, async_waterfall;
(function () {

	async_each = function (self, fn) {
		var $ = new SQuery();
		self.done(function (ctx) {
			var dfrs = map(ctx, function (node) {
				return fn($, node);
			});
			_when(dfrs, function () {
				return $.resolve($);
			});
		});
		return $;
	};
	async_map = function (self, fn) {
		return async_next(self, function ($, source) {
			return async_waterfall(source, function (node, i) {
				return dfr_run(function (resolve) {
					function add(x) {
						$.add(x);
						resolve();
					}
					var x = fn(node, i);
					if (x == null || typeof x.then !== "function") {
						add(x);
						return;
					}
					x.then(add, function () {
						return add(null);
					});
				});
			});
		});
	};

	async_at = function (self, index, fn) {
		var $ = new SQuery();
		self.done(function (ctx) {
			if (index >= ctx.length) {
				$.resolve($);
				return;
			}
			_always(fn($, self[index]), function () {
				return $.resolve($);
			});
		});
		return $;
	};

	async_next = function (self, fn) {
		var $ = new SQuery();
		self.done(function (ctx) {
			_always(fn($, ctx), function () {
				return $.resolve($);
			});
		});
		return $;
	};

	async_aggr = function (accum, $, fn) {
		return dfr_run(function (resolve, reject) {
			$.done(function ($) {
				async_waterfall($, function (node) {
					return fn(accum, node).then(function (val) {
						accum = val;
					});
				}).then(function () {
					return resolve(accum);
				}, function (error) {
					return reject(error);
				});
			});
		});
	};

	async_traverse = function (self, fn) {
		return async_each(self, function ($, node) {
			return _always(fn(node), function (mix) {
				$.add(mix);
			});
		});
	};

	async_getValueOf = function (index, self, getter) {
		return dfr_run(function (resolve) {
			self.done(function (ctx) {
				if (index >= ctx.length) {
					resolve(null);
					return;
				}
				getter(ctx[index]).then(resolve, function (error) {
					console.error("Getter error", error);
					resolve(null);
				});
			});
		});
	};

	async_mutate = function (self, fn) {
		var $ = new SQuery();
		self.done(function (ctx) {
			var dfrs = map(ctx, function (node) {
				$.add(node);
				return fn(node);
			});
			_when(dfrs, function () {
				return $.resolve($);
			});
		});
		return $;
	};

	async_waterfall = function (arr, fn) {
		return dfr_run(function (resolve, reject) {
			var i = -1,
			    imax = arr.length;

			function next() {
				if (++i >= imax) {
					resolve();
					return;
				}
				fn(arr[i], i).then(function () {
					return next();
				}, function (error) {
					return reject(error);
				});
			}
			next();
		});
	};

	function _always(dfr, fn) {
		if (dfr == null) {
			fn();
			return;
		}
		return dfr.then(function () {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			fn.apply(undefined, args);
		}, function (error) {
			fn();
		});
	}

	function _when(dfrs, callback) {
		if (dfrs.length === 0) {
			callback();
			return;
		}

		var count = dfrs.length;
		function ready() {
			if (--count < 1) {
				callback();
				return;
			}
		}
		each(dfrs, function (x) {
			return _always(x, ready);
		});
	}
})();
//# sourceMappingURL=async.es6.map
// end:source utils/async.es6

// source scripts/exports.es6
// source ./nodeMatchesSelector.es6
"use strict";

function scripts_nodeMatchesSelector() {
	var el = arguments[0],
	    selector = arguments[1];
	var docEl = document.documentElement,
	    matchesSelector = docEl.webkitMatchesSelector || docEl.mozMatchesSelector || docEl.msMatchesSelector || docEl.oMatchesSelector || docEl.matchesSelector;

	return el == null || el.nodeType !== 1 ? false : matchesSelector.call(el, selector);
};
//# sourceMappingURL=nodeMatchesSelector.es6.map
// end:source ./nodeMatchesSelector.es6
// source ./nodeParent.es6
"use strict";

function scripts_nodeParent() {
	var el = arguments[0];
	return el.parentNode;
};
//# sourceMappingURL=nodeParent.es6.map
// end:source ./nodeParent.es6
// source ./nodeClosest.es6
"use strict";

function scripts_nodeClosest() {
	// source ./nodeMatchesSelector.es6
	"use strict";

	function scripts_nodeMatchesSelector() {
		var el = arguments[0],
		    selector = arguments[1];
		var docEl = document.documentElement,
		    matchesSelector = docEl.webkitMatchesSelector || docEl.mozMatchesSelector || docEl.msMatchesSelector || docEl.oMatchesSelector || docEl.matchesSelector;

		return el == null || el.nodeType !== 1 ? false : matchesSelector.call(el, selector);
	};
	//# sourceMappingURL=nodeMatchesSelector.es6.map
	// end:source ./nodeMatchesSelector.es6

	var el = arguments[0],
	    selector = arguments[1];
	while (el != null && el.parentNode != null) {
		el = el.parentNode;
		if (scripts_nodeMatchesSelector(el, selector)) {
			return el;
		}
	}
	return null;
};
//# sourceMappingURL=nodeClosest.es6.map
// end:source ./nodeClosest.es6
// source ./nodeChildren.es6
"use strict";

function scripts_nodeChildren() {
	// source ./nodeMatchesSelector.es6
	"use strict";

	function scripts_nodeMatchesSelector() {
		var el = arguments[0],
		    selector = arguments[1];
		var docEl = document.documentElement,
		    matchesSelector = docEl.webkitMatchesSelector || docEl.mozMatchesSelector || docEl.msMatchesSelector || docEl.oMatchesSelector || docEl.matchesSelector;

		return el == null || el.nodeType !== 1 ? false : matchesSelector.call(el, selector);
	};
	//# sourceMappingURL=nodeMatchesSelector.es6.map
	// end:source ./nodeMatchesSelector.es6
	var el = arguments[0],
	    selector = arguments[1];
	var out = [];

	var node = el.firstChild;
	while (node != null) {
		if (selector == null || scripts_nodeMatchesSelector(node, selector)) {
			out.push(node);
		}
		node = node.nextSibling;
	}
	return out;
}
//# sourceMappingURL=nodeChildren.es6.map
// end:source ./nodeChildren.es6
// source ./nodeNext.es6
"use strict";

function scripts_nodeNext() {
	// source ./nodeMatchesSelector.es6
	"use strict";

	function scripts_nodeMatchesSelector() {
		var el = arguments[0],
		    selector = arguments[1];
		var docEl = document.documentElement,
		    matchesSelector = docEl.webkitMatchesSelector || docEl.mozMatchesSelector || docEl.msMatchesSelector || docEl.oMatchesSelector || docEl.matchesSelector;

		return el == null || el.nodeType !== 1 ? false : matchesSelector.call(el, selector);
	};
	//# sourceMappingURL=nodeMatchesSelector.es6.map
	// end:source ./nodeMatchesSelector.es6
	var el = arguments[0],
	    selector = arguments[1];
	var node = el.nextElementSibling;
	if (selector == null) {
		return node;
	}

	while (node != null) {
		if (scripts_nodeMatchesSelector(node, selector)) {
			return node;
		}
		node = node.nextElementSibling;
	}
	return null;
}
//# sourceMappingURL=nodeNext.es6.map
// end:source ./nodeNext.es6
// source ./nodeRemove.es6
"use strict";

function scripts_nodeRemove() {
	var el = arguments[0];
	if (el.parentNode != null) {
		el.parentNode.removeChild(el);
	}
}
//# sourceMappingURL=nodeRemove.es6.map
// end:source ./nodeRemove.es6
// source ./nodeAttribute.es6
"use strict";

function scripts_nodeAttribute() {
	// source ./_str.es6
	"use strict";

	function str_toCamelCase(str) {
		return str.replace(/\-(.)/g, function (_, letter) {
			return letter.toUpperCase();
		});
	}
	function str_toDashed(str) {
		return key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
	}
	//# sourceMappingURL=_str.es6.map
	// end:source ./_str.es6
	// source ./_inlineGetSetKeyValue.es6
	"use strict";

	var argsCount = arguments.length;
	if (argsCount < 2) {
		return;
	}
	var el = arguments[0],
	    mix = arguments[1];
	if (el == null || mix == null) {
		return;
	}

	if (argsCount == 2 && typeof mix === "string") {
		return get(el, mix);
	}
	if (typeof mix === "object") {
		for (var key in mix) {
			set(el, key, mix[key]);
		}
		return;
	}
	if (argsCount > 2 && typeof mix === "string") {
		var val = arguments[2];
		set(el, mix, val);
		return;
	}
	//# sourceMappingURL=_inlineGetSetKeyValue.es6.map
	// end:source ./_inlineGetSetKeyValue.es6

	function get(el, key) {
		return el.getAttribute(key);
	}
	function set(el, key, value) {
		return el.setAttribute(key, value);
	}
};
//# sourceMappingURL=nodeAttribute.es6.map
// end:source ./nodeAttribute.es6
// source ./nodeAttributeRemove.es6
"use strict";

function scripts_nodeDatasetRemove() {
	var el = arguments[0],
	    key = arguments[1];
	if (el == null || key == null) {
		return;
	}
	el.removeAttribute(key);
}
//# sourceMappingURL=nodeAttributeRemove.es6.map
// end:source ./nodeAttributeRemove.es6
// source ./nodeProperty.es6
"use strict";

function scripts_nodeProperty() {
	// source ./_inlineGetSetKeyValue.es6
	"use strict";

	var argsCount = arguments.length;
	if (argsCount < 2) {
		return;
	}
	var el = arguments[0],
	    mix = arguments[1];
	if (el == null || mix == null) {
		return;
	}

	if (argsCount == 2 && typeof mix === "string") {
		return get(el, mix);
	}
	if (typeof mix === "object") {
		for (var key in mix) {
			set(el, key, mix[key]);
		}
		return;
	}
	if (argsCount > 2 && typeof mix === "string") {
		var val = arguments[2];
		set(el, mix, val);
		return;
	}
	//# sourceMappingURL=_inlineGetSetKeyValue.es6.map
	// end:source ./_inlineGetSetKeyValue.es6
	function get(el, key) {
		return el[key];
	}
	function set(el, key, val) {
		el[key] = val;
	}
}
//# sourceMappingURL=nodeProperty.es6.map
// end:source ./nodeProperty.es6
// source ./nodeFunctionCall.es6
"use strict";

function scripts_nodeFunctionCall() {
	var el = arguments[0],
	    name = arguments[1],
	    args = Array.prototype.slice.call(arguments, 2);

	return el[name].apply(el, args);
}
//# sourceMappingURL=nodeFunctionCall.es6.map
// end:source ./nodeFunctionCall.es6
// source ./nodeDataset.es6
"use strict";

function scripts_nodeDataset() {
	// source ./nodeDatasetRemove.es6
	"use strict";

	function scripts_nodeDatasetRemove() {
		var el = arguments[0],
		    key = arguments[1];
		if (el == null || key == null) {
			return;
		}
		if (el.dataset) {
			delete el.dataset[key];
			return;
		}
		el.removeAttribute(key);
	}
	//# sourceMappingURL=nodeDatasetRemove.es6.map
	// end:source ./nodeDatasetRemove.es6
	// source ./_str.es6
	"use strict";

	function str_toCamelCase(str) {
		return str.replace(/\-(.)/g, function (_, letter) {
			return letter.toUpperCase();
		});
	}
	function str_toDashed(str) {
		return key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
	}
	//# sourceMappingURL=_str.es6.map
	// end:source ./_str.es6
	// source ./_inlineGetSetKeyValue.es6
	"use strict";

	var argsCount = arguments.length;
	if (argsCount < 2) {
		return;
	}
	var el = arguments[0],
	    mix = arguments[1];
	if (el == null || mix == null) {
		return;
	}

	if (argsCount == 2 && typeof mix === "string") {
		return get(el, mix);
	}
	if (typeof mix === "object") {
		for (var key in mix) {
			set(el, key, mix[key]);
		}
		return;
	}
	if (argsCount > 2 && typeof mix === "string") {
		var val = arguments[2];
		set(el, mix, val);
		return;
	}
	//# sourceMappingURL=_inlineGetSetKeyValue.es6.map
	// end:source ./_inlineGetSetKeyValue.es6

	function get(el, key) {
		key = str_toCamelCase(key);
		if (el.dataset) {
			return el.dataset[key];
		}
		return el.getAttribute("data-" + str_toDashed(key));
	}
	function set(el, key, val) {
		if (val == null) {
			scripts_nodeDatasetRemove(el, key);
			return;
		}
		if (el.dataset) {
			el.dataset[key] = val;
			return;
		}
		el.setAttribute(el, "data-" + str_toDashed(key), val);
	}
};
//# sourceMappingURL=nodeDataset.es6.map
// end:source ./nodeDataset.es6
// source ./nodeDatasetRemove.es6
"use strict";

function scripts_nodeDatasetRemove() {
	var el = arguments[0],
	    key = arguments[1];
	if (el == null || key == null) {
		return;
	}
	if (el.dataset) {
		delete el.dataset[key];
		return;
	}
	el.removeAttribute(key);
}
//# sourceMappingURL=nodeDatasetRemove.es6.map
// end:source ./nodeDatasetRemove.es6
// source ./nodeSelectTextRange.es6
"use strict";

function scripts_nodeSelectTextRange() {
	var el = arguments[0],
	    args = Array.prototype.slice.call(arguments, 1);
	var txt = el.value;

	if (args.length === 0) {
		select(0, txt.length);
		return;
	}

	var str = args[0];
	if (typeof str === "string") {
		var start = txt.indexOf(str);
		if (start !== -1) {
			select(start, start + str.length);
		}
		return;
	}

	var start = args[0],
	    end = args[1];
	if (typeof start === "number" && typeof end === "number") {
		select(start, end);
	}

	function select(start, end) {
		if (el.focus) {
			el.focus();
		}
		if (el.selectionStart !== void 0) {
			el.selectionStart = start;
			el.selectionEnd = end;
			return;
		}
		if (el.setSelectionRange !== void 0) {
			el.setSelectionRange(start, end);
			return;
		}
		throw Error("Unable to select the range");
	}
}
//# sourceMappingURL=nodeSelectTextRange.es6.map
// end:source ./nodeSelectTextRange.es6
// source ./nodeSelectOption.es6
"use strict";

function scripts_nodeSelectOption() {
	// source ./events/trigger.es6
	"use strict";

	function scripts_nodeTrigger() {
		var el = arguments[0],
		    type = arguments[1],
		    data = arguments[2];

		if (data == null && typeof el[type] === "function") {
			el[type]();
			return;
		}

		var event = create(type, data);
		dispatch(el, event);

		function createEvent(type) {
			var event = document.createEvent("Event");
			event.initEvent(type, true, true);
			return event;
		}
		function createCustomEvent(type) {
			var data = arguments[1] === undefined ? {} : arguments[1];

			var event = document.createEvent("CustomEvent");
			event.initCustomEvent(type, true, true, data);
			return event;
		}
		function create(type, data) {
			if (data == null || "on" + type in el) {
				return createEvent(type);
			}return createCustomEvent(type, data);
		}
		function dispatch(node, event) {
			node.dispatchEvent(event);
		};
	}
	//# sourceMappingURL=trigger.es6.map
	// end:source ./events/trigger.es6

	var el = arguments[0],
	    str = arguments[1];

	var opts,
	    opt = find(byText);
	if (opt == null) opt = find(byAttr("value"));
	if (opt == null) opt = find(byAttr("name"));
	if (opt == null) opt = find(byAttr("id"));
	if (opt == null) throw Error("Option not found: " + str);

	var optEl = opt[0],
	    index = opt[1];

	el.selectedIndex = index;

	scripts_nodeTrigger(optEl, "click");
	scripts_nodeTrigger(el, "change");

	function byText(el, i) {
		var txt = el.textContent || "";
		return txt.trim().indexOf(str) !== -1;
	}
	function byAttr(name) {
		return function (el) {
			return (el.getAttribute(name) || "").trim() === str;
		};
	}
	function find(fn) {
		if (opts == null) opts = el.querySelectorAll("option");

		var imax = opts.length,
		    i = 0,
		    x;
		for (; i < imax; i++) {
			x = opts[i];
			if (fn(x, i) === true) {
				return [x, i];
			}
		}
		return null;
	}
}
//# sourceMappingURL=nodeSelectOption.es6.map
// end:source ./nodeSelectOption.es6
// source ./class/add.es6
"use strict";

function scripts_nodeClassAdd() {
	// source ./_inline.es6
	"use strict";

	var el = arguments[0],
	    klass = arguments[1];
	if (el == null || klass == null) {
		return;
	}
	//# sourceMappingURL=_inline.es6.map
	// end:source ./_inline.es6
	// source ./has.es6
	"use strict";

	function scripts_nodeClassHas() {
		// source ./_inline.es6
		"use strict";

		var el = arguments[0],
		    klass = arguments[1];
		if (el == null || klass == null) {
			return;
		}
		//# sourceMappingURL=_inline.es6.map
		// end:source ./_inline.es6
		if (el.classList) {
			return el.classList.contains(klass);
		}
		return -1 !== (" " + el.className + " ").indexOf(" " + klass + " ");
	}
	//# sourceMappingURL=has.es6.map
	// end:source ./has.es6
	if (scripts_nodeClassHas(el, klass)) {
		return;
	}
	if (el.classList) {
		el.classList.add(klass);
		return;
	}
	el.className += " " + klass;
}
//# sourceMappingURL=add.es6.map
// end:source ./class/add.es6
// source ./class/remove.es6
"use strict";

function scripts_nodeClassRemove() {
	// source ./_inline.es6
	"use strict";

	var el = arguments[0],
	    klass = arguments[1];
	if (el == null || klass == null) {
		return;
	}
	//# sourceMappingURL=_inline.es6.map
	// end:source ./_inline.es6
	// source ./has.es6
	"use strict";

	function scripts_nodeClassHas() {
		// source ./_inline.es6
		"use strict";

		var el = arguments[0],
		    klass = arguments[1];
		if (el == null || klass == null) {
			return;
		}
		//# sourceMappingURL=_inline.es6.map
		// end:source ./_inline.es6
		if (el.classList) {
			return el.classList.contains(klass);
		}
		return -1 !== (" " + el.className + " ").indexOf(" " + klass + " ");
	}
	//# sourceMappingURL=has.es6.map
	// end:source ./has.es6
	if (scripts_nodeClassHas(el, klass) === false) {
		return;
	}
	if (el.classList) {
		el.classList.remove(klass);
		return;
	}
	el.className = (" " + el.className + " ").replace(" " + klass + " ", " ");
}
//# sourceMappingURL=remove.es6.map
// end:source ./class/remove.es6
// source ./class/toggle.es6
"use strict";

function scripts_nodeClassToggle() {
	// source ./_inline.es6
	"use strict";

	var el = arguments[0],
	    klass = arguments[1];
	if (el == null || klass == null) {
		return;
	}
	//# sourceMappingURL=_inline.es6.map
	// end:source ./_inline.es6
	// source ./has.es6
	"use strict";

	function scripts_nodeClassHas() {
		// source ./_inline.es6
		"use strict";

		var el = arguments[0],
		    klass = arguments[1];
		if (el == null || klass == null) {
			return;
		}
		//# sourceMappingURL=_inline.es6.map
		// end:source ./_inline.es6
		if (el.classList) {
			return el.classList.contains(klass);
		}
		return -1 !== (" " + el.className + " ").indexOf(" " + klass + " ");
	}
	//# sourceMappingURL=has.es6.map
	// end:source ./has.es6
	if (el.classList) {
		el.classList.toggle(klass);
		return;
	}

	if (scripts_nodeClassHas(el, klass)) {
		scripts_nodeClassRemove(el, klass);
		return;
	}
	scripts_nodeClassAdd(el, klass);
}
//# sourceMappingURL=toggle.es6.map
// end:source ./class/toggle.es6
// source ./class/has.es6
"use strict";

function scripts_nodeClassHas() {
	// source ./_inline.es6
	"use strict";

	var el = arguments[0],
	    klass = arguments[1];
	if (el == null || klass == null) {
		return;
	}
	//# sourceMappingURL=_inline.es6.map
	// end:source ./_inline.es6
	if (el.classList) {
		return el.classList.contains(klass);
	}
	return -1 !== (" " + el.className + " ").indexOf(" " + klass + " ");
}
//# sourceMappingURL=has.es6.map
// end:source ./class/has.es6
// source ./events/trigger.es6
"use strict";

function scripts_nodeTrigger() {
	var el = arguments[0],
	    type = arguments[1],
	    data = arguments[2];

	if (data == null && typeof el[type] === "function") {
		el[type]();
		return;
	}

	var event = create(type, data);
	dispatch(el, event);

	function createEvent(type) {
		var event = document.createEvent("Event");
		event.initEvent(type, true, true);
		return event;
	}
	function createCustomEvent(type) {
		var data = arguments[1] === undefined ? {} : arguments[1];

		var event = document.createEvent("CustomEvent");
		event.initCustomEvent(type, true, true, data);
		return event;
	}
	function create(type, data) {
		if (data == null || "on" + type in el) {
			return createEvent(type);
		}return createCustomEvent(type, data);
	}
	function dispatch(node, event) {
		node.dispatchEvent(event);
	};
}
//# sourceMappingURL=trigger.es6.map
// end:source ./events/trigger.es6
// source ./css/nodeCss.es6
"use strict";

function scripts_nodeCss() {
	// source ../_inlineGetSetKeyValue.es6
	"use strict";

	var argsCount = arguments.length;
	if (argsCount < 2) {
		return;
	}
	var el = arguments[0],
	    mix = arguments[1];
	if (el == null || mix == null) {
		return;
	}

	if (argsCount == 2 && typeof mix === "string") {
		return get(el, mix);
	}
	if (typeof mix === "object") {
		for (var key in mix) {
			set(el, key, mix[key]);
		}
		return;
	}
	if (argsCount > 2 && typeof mix === "string") {
		var val = arguments[2];
		set(el, mix, val);
		return;
	}
	//# sourceMappingURL=_inlineGetSetKeyValue.es6.map
	// end:source ../_inlineGetSetKeyValue.es6
	// source ../_str.es6
	"use strict";

	function str_toCamelCase(str) {
		return str.replace(/\-(.)/g, function (_, letter) {
			return letter.toUpperCase();
		});
	}
	function str_toDashed(str) {
		return key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
	}
	//# sourceMappingURL=_str.es6.map
	// end:source ../_str.es6

	function get(el, key) {
		return getComputedStyle(el)[str_toCamelCase(key)];
	}
	function set(el, key, val) {
		console.log(arguments);
		el.style[str_toCamelCase(key)] = val;
	}
}
//# sourceMappingURL=nodeCss.es6.map
// end:source ./css/nodeCss.es6
//# sourceMappingURL=exports.es6.map
// end:source scripts/exports.es6

// source proto/exports.es6
"use strict";

var SQueryProto = {
	length: 0,
	constructor: function constructor(mix) {
		if (this instanceof SQuery === false) {
			return new SQuery(mix);
		}
		if (arguments.length === 0) {
			return;
		}
		this.add(mix);
		this.resolve(this);
	} };

// source ./collection.es6
"use strict";

_.obj_extend(SQueryProto, {
	add: function add(mix) {
		if (mix == null) {
			return this;
		}if (_.is_Array(mix) === true) {
			return each(mix, this.add, this);
		}this[this.length++] = mix;
		return this;
	},
	eq: function eq(index) {
		return async_next(this, function ($, source) {
			if (index < source.length) {
				$.add(source[index]);
			}
		});
	},
	slice: function slice() {
		var start = arguments[0] === undefined ? 0 : arguments[0];
		var end = arguments[1] === undefined ? null : arguments[1];

		return async_next(this, function ($, source) {
			var i = start;
			if (end > source.length) {
				end = source.length;
			}
			if (i < end) {
				for (; i < end; i++) {
					$.add(source[i]);
				}
			}
		});
	},
	each: function each(fn) {
		return async_next(this, function ($, source) {
			return async_waterfall(source, function (node, i) {
				$.add(node);
				return fn(node, i);
			});
		});
	},
	map: function map(fn) {
		return async_map(this, fn);
	},
	toArray: function toArray() {
		var _this = this;

		return dfr_run(function (resolve) {
			_this.done(function ($) {
				var arr = Array.prototype.slice.call($);
				resolve(arr);
			});
		});
	}
});
//# sourceMappingURL=collection.es6.map
// end:source ./collection.es6
// source ./traverse.es6
"use strict";

(function () {

	_.obj_extend(SQueryProto, {
		find: function find(sel) {
			return async_traverse(this, function (node) {
				return node.findElements({ css: sel });
			});
		},
		filter: function filter(sel) {
			return async_traverse(this, function (node) {
				return dfr_run(function (resolve) {
					node_eval(node, scripts_nodeMatchesSelector, sel).done(function (match) {
						if (match) {
							resolve(node);
							return;
						}
						resolve();
					});
				});
			});
		},
		parent: function parent() {
			return async_traverse(this, function (node) {
				return node_eval(node, scripts_nodeParent);
			});
		},
		closest: function closest(sel) {
			return async_traverse(this, function (node) {
				return node_eval(node, scripts_nodeClosest, sel);
			});
		},
		children: function children(sel) {
			return async_traverse(this, function (node) {
				return node_eval(node, scripts_nodeChildren, sel);
			});
		},
		next: function next(sel) {
			return async_traverse(this, function (node) {
				return node_eval(node, scripts_nodeNext, sel);
			});
		}
	});
})();
//# sourceMappingURL=traverse.es6.map
// end:source ./traverse.es6
// source ./properties.es6
"use strict";

(function () {

	_.obj_extend(SQueryProto, {
		attr: function attr(mix) {
			var val = arguments[1] === undefined ? null : arguments[1];

			if (arguments.length === 1 && typeof mix === "string") {
				return async_getValueOf(0, this, function (node) {
					return node.getAttribute(mix);
				});
			}
			return async_mutate(this, function (node) {
				return node_eval(node, scripts_nodeAttribute, mix, val);
			});
		},
		val: (function (_val) {
			var _valWrapper = function val() {
				return _val.apply(this, arguments);
			};

			_valWrapper.toString = function () {
				return _val.toString();
			};

			return _valWrapper;
		})(function () {
			var val = arguments[0] === undefined ? null : arguments[0];

			if (arguments.length === 0) {
				return async_getValueOf(0, this, function (node) {
					return node_eval(node, scripts_nodeProperty, "value");
				});
			}
			return async_mutate(this, function (node) {
				return node_eval(node, scripts_nodeProperty, "value", val);
			});
		}),
		data: function data(key) {
			var val = arguments[1] === undefined ? null : arguments[1];

			if (arguments.length === 1) {
				return async_getValueOf(0, this, function (node) {
					return node_eval(node, scripts_nodeDataset, key);
				});
			}
			return async_mutate(this, function (node) {
				return node_eval(node, scripts_nodeDataset, key, val);
			});
		},
		prop: function prop(key) {
			var val = arguments[1] === undefined ? null : arguments[1];

			if (arguments.length === 1) {
				return async_getValueOf(0, this, function (node) {
					return node_eval(node, scripts_nodeProperty, key);
				});
			}
			return async_mutate(this, function (node) {
				return node_eval(node, scripts_nodeProperty, key, val);
			});
		}
	});
})();
//# sourceMappingURL=properties.es6.map
// end:source ./properties.es6
// source ./content.es6
"use strict";

(function () {

	_.obj_extend(SQueryProto, {
		text: function text() {
			var str = arguments[0] === undefined ? null : arguments[0];

			if (arguments.length === 0) {
				return async_aggr("", this, function (accum, node) {
					return node_eval(node, scripts_nodeProperty, "textContent").then(function (val) {
						return accum + val;
					});
				});
			}
			return async_each(this, function ($, node) {
				return node_eval(node, scripts_nodeProperty, "textContent", str).done(function () {
					return $.add(node);
				});
			});
		},
		html: function html() {
			var str = arguments[0] === undefined ? null : arguments[0];

			if (arguments.length === 0) {
				return async_getValueOf(0, this, function (node) {
					return node_eval(node, scripts_nodeProperty, "innerHTML");
				});
			}
			return async_each(this, function ($, node) {
				return node_eval(node, scripts_nodeProperty, "textContent", str).done(function () {
					return $.add(node);
				});
			});
		} });

	(function () {
		var map = {
			append: "beforeend",
			prepend: "afterbegin",
			before: "beforebegin",
			after: "afterend"
		};

		Object.keys(map).forEach(function (fn) {
			var position = map[fn];
			SQueryProto[fn] = function (html) {
				return async_each(this, function ($, node) {
					return node_eval(node, scripts_nodeFunctionCall, "insertAdjacentHTML", position, html).done(function () {
						return $.add(node);
					});
				});
			};
		});
	})();
})();
//# sourceMappingURL=content.es6.map
// end:source ./content.es6
// source ./manipulate.es6
"use strict";

(function () {

	_.obj_extend(SQueryProto, {
		remove: function remove() {
			return async_each(this, function ($, node) {
				return node_eval(node, scripts_nodeRemove).done(function () {
					return $.add(node);
				});
			});
		} });
})();
//# sourceMappingURL=manipulate.es6.map
// end:source ./manipulate.es6
// source ./events.es6
"use strict";

(function () {

	_.obj_extend(SQueryProto, {
		click: function click() {
			return async_each(this, function ($, node) {
				return node.click().then(function () {
					$.add(node);
				});
			});
		},
		trigger: function trigger(type) {
			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				args[_key - 1] = arguments[_key];
			}

			return async_each(this, function ($, node) {
				return node_eval.apply(undefined, [node, scripts_nodeTrigger, type].concat(args)).done(function () {
					return $.add(node);
				});
			});
		},
		select: function select() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			return async_mutate(this, function (node, $) {
				return node.getTagName().then(function (name) {
					var fn = name === "select" ? scripts_nodeSelectOption : scripts_nodeSelectTextRange;

					return node_eval.apply(undefined, [node, fn].concat(args));
				});
			});
		} });

	["focus", "blur"].forEach(function (name) {
		SQueryProto[name] = function () {
			return async_each(this, function ($, node) {
				return node_eval(node, scripts_nodeFunctionCall, name).done(function () {
					return $.add(node);
				});
			});
		};
	});
})();
//# sourceMappingURL=events.es6.map
// end:source ./events.es6
// source ./keyboard.es6
"use strict";

(function () {

	var aliases = {
		ctrl: "control",
		backspace: "back_space",
		esc: "escape",
		left: "arrow_left",
		right: "arrow_right",
		up: "arrow_up",
		down: "arrow_down" };

	_.obj_extend(SQueryProto, {
		sendKeys: function sendKeys(mix) {
			return async_each(this, function ($, node) {
				return node.sendKeys(mix).then(function () {
					$.add(node);
				});
			});
		},
		type: function type(str) {
			var arr = toSequance(str),
			    fn = getSequenceFunction(arr);
			return async_each(this, function ($, node) {
				return fn(node).then(function () {
					$.add(node);
				});
			});
		},
		press: function press(str) {
			var key = toCombination(str);
			return async_each(this, function ($, node) {
				return node.sendKeys(key).then(function () {
					$.add(node);
				});
			});
		} });

	function toSequance(str) {
		var delimiter = "_%%%%%%_";
		str = str.replace(/\{([\w_]+)\}/g, function (full, name) {
			var key = (aliases[name] || name).toUpperCase();
			if (key in _webdriver.Key === false) {
				return full;
			}
			return delimiter + key + delimiter;
		});
		var parts = str.split(delimiter),
		    i = 1,
		    imax = parts.length;

		return parts.map(function (str, i) {
			if (i % 2 === 0) {
				return str;
			}
			return _webdriver.Key[str];
		});
	}
	function toCombination(str) {
		var keys = str.split("+");
		keys.forEach(function (x, i) {
			if (x === "") {
				keys[i] = "+";
				return;
			}
			if (isSpecial(x)) {
				keys[i] = getSpecial(x);
				return;
			}
		});
		if (keys.length === 0) {
			return keys[0];
		}
		return _webdriver.Key.chord.apply(_webdriver.Key, keys);
	};

	function getSpecial(name) {
		var key = (aliases[name] || name).toUpperCase();
		return _webdriver.Key[key];
	}
	function isSpecial(name) {
		var key = (aliases[name] || name).toUpperCase();
		return key in _webdriver.Key;
	}
	function getSequenceFunction(arr) {
		return function (node) {
			var dfrs = arr.map(function (str) {
				return node.sendKeys(str);
			});
			return dfrs[dfrs.length - 1];
		};
	}
})();
//# sourceMappingURL=keyboard.es6.map
// end:source ./keyboard.es6
// source ./css.es6
"use strict";

(function () {

	_.obj_extend(SQueryProto, {
		css: function css(mix) {
			var val = arguments[1] === undefined ? null : arguments[1];

			if (arguments.length === 1 && typeof mix === "string") {
				return async_getValueOf(0, this, function (node) {
					return node.getCssValue(mix);
				});
			}
			return async_mutate(this, function (node) {
				return node_eval(node, scripts_nodeCss, mix, val);
			});
		},
		height: function height() {
			var val = arguments[0] === undefined ? null : arguments[0];

			if (val == null) {
				return async_getValueOf(0, this, function (node) {
					return node.getSize().then(function (x) {
						return x.height;
					});
				});
			}
			return this.css("height", val);
		},
		innerHeight: function innerHeight(val) {
			return async_getValueOf(0, this, function (node) {
				return node_eval(node, scripts_nodeProperty, "offsetHeight");
			});
		},
		width: function width() {
			var val = arguments[0] === undefined ? null : arguments[0];

			if (val == null) {
				return async_getValueOf(0, this, function (node) {
					return node.getSize().then(function (x) {
						return x.width;
					});
				});
			}
			return this.css("width", val);
		},
		innerWidth: function innerWidth(val) {
			return async_getValueOf(0, this, function (node) {
				return node_eval(node, scripts_nodeProperty, "offsetWidth");
			});
		},
		offset: function offset() {
			return async_getValueOf(0, this, function (node) {
				return node_eval(node, scripts_nodeFunctionCall, "getBoundingClientRect").then(function (x) {
					return { top: x.top, left: x.left };
				});
			});
		},
		position: function position() {
			return async_getValueOf(0, this, function (node) {
				return node_eval(node, scripts_nodeProperty, "offsetTop").then(function (top) {
					return node_eval(node, scripts_nodeProperty, "offsetLeft").then(function (left) {
						return { top: top, left: left };
					});
				});
			});
		},
		scrollTop: function scrollTop() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			return async_getValueOf(0, this, function (node) {
				return node_eval.apply(undefined, [node, scripts_nodeProperty, "scrollTop"].concat(args));
			});
		},
		scrollLeft: function scrollLeft() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			return async_getValueOf(0, this, function (node) {
				return node_eval.apply(undefined, [node, scripts_nodeProperty, "scrollLeft"].concat(args));
			});
		}
	});
})();
//# sourceMappingURL=css.es6.map
// end:source ./css.es6
// source ./class.es6
"use strict";

(function () {
	_.obj_extend(SQueryProto, {
		hasClass: function hasClass(name) {
			return async_getValueOf(0, this, function (node) {
				return node_eval(node, scripts_nodeClassHas, name);
			});
		},
		addClass: classMutationDelegate(scripts_nodeClassAdd),
		removeClass: classMutationDelegate(scripts_nodeClassRemove),
		toggleClass: classMutationDelegate(scripts_nodeClassToggle) });

	function classMutationDelegate(fn) {
		return function (name) {
			return async_each(this, function ($, node) {
				return node_eval(node, fn, name).done(function () {
					return $.add(node);
				});
			});
		};
	}
})();
//# sourceMappingURL=class.es6.map
// end:source ./class.es6
// source ./driver.es6
"use strict";

(function () {

	_.obj_extend(SQueryProto, {
		eval: function evaluate(mix) {
			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				args[_key - 1] = arguments[_key];
			}

			return async_getValueOf(0, this, function (node) {
				return node_eval.apply(undefined, [node, mix].concat(args));
			});
		}
	});
})();
//# sourceMappingURL=driver.es6.map
// end:source ./driver.es6
//# sourceMappingURL=exports.es6.map
// end:source proto/exports.es6
// source SQuery.es6
"use strict";

var SQuery = _.class_create(_.class_Dfr, SQueryProto);
//# sourceMappingURL=SQuery.es6.map
// end:source SQuery.es6

// source static/exports.es6
"use strict";

SQuery.fn = SQuery.prototype;

// source ./build.es6
"use strict";

(function () {

	SQuery.build = function (config) {
		var config = _.obj_extend(Object.create(DefaultConfig), config);

		var browser = require("selenium-webdriver/" + config.name.toLowerCase());

		var options = new browser.Options();

		config.setBinaryPath(options);
		config.setArguments(options);
		config.setLogging(options);

		var builder = new _webdriver.Builder().forBrowser(config.name.toLowerCase());
		config.setOptions(builder, options);
		config.applyOptions(builder, options);
		return builder.build();
	};

	SQuery.load = function (url, config) {
		if (url[0] === "/") {
			url = "file://" + process.cwd() + url;
		}

		if (driver == null) {
			driver = SQuery.build(config);
		}

		var query = new SQuery();
		driver.get(url).then(function () {
			query.add(driver);
			query.resolve(query);
		}, function (error) {
			if (error.code !== 100) {
				query.reject(error);
				return;
			}
			driver = SQuery.build(config);
			driver.get(url).then(function () {
				query.add(driver);
				query.resolve(query);
			}, function (error) {
				return query.reject(error);
			});
		});

		return query;
	};

	var driver = null;
	var DefaultConfig;
	(function () {

		DefaultConfig = {
			name: "Chrome",
			args: ["no-sandbox"],
			binaryPath: null,

			applyOptions: function applyOptions(builder, options) {
				var fn = "set" + this.name + "Options";
				if (typeof builder[fn] !== "function") {
					throw Error("Default function not found, please override 'applyOptions(builder, options)' to set it yourself. Was looking for : " + fn);
				}
				builder[fn](options);
			},

			setOptions: function setOptions(builder, options) {},

			setArguments: function setArguments(options) {
				options.addArguments(this.args);
			},
			setBinaryPath: function setBinaryPath(options) {
				var fn = "set" + this.name + "BinaryPath";
				if (typeof options[fn] !== "function") {
					throw Error("Default function not found, please override 'setBinaryPath' to set it yourself. Was looking for: " + fn);
				}

				if (this.binaryPath) {
					options[fn](this.binaryPath);
				}
			},
			setLogging: function setLogging(options) {
				options.setLoggingPrefs({});
			}
		};

		if (typeof process.env.BROWSER_PATH !== "undefined") {
			DefaultConfig.binaryPath = process.env.BROWSER_PATH;
		}
	})();
})();
//# sourceMappingURL=build.es6.map
// end:source ./build.es6
// source ./eval.es6
"use strict";

SQuery.eval = function evaluate(mix) {
	return node_evalGlobal(mix);
};
//# sourceMappingURL=eval.es6.map
// end:source ./eval.es6
// source ./config.es6
"use strict";

SQuery.setDriver = function (driver) {
	_webdriver = driver;
};
SQuery.getDriver = function () {
	return _webdriver;
};
//# sourceMappingURL=config.es6.map
// end:source ./config.es6
//# sourceMappingURL=exports.es6.map
// end:source static/exports.es6
//# sourceMappingURL=index.es6.map
// end:source /src/index.es6

module.exports = SQuery;