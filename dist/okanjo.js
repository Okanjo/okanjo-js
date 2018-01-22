/*! okanjo-js v1.5.3 | (c) 2013 Okanjo Partners Inc | https://okanjo.com/ */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.okanjo = factory();
  }
}(this, function() {
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Production steps of ECMA-262, Edition 6, 22.1.2.1
if (!Array.from) {
    Array.from = function () {
        var toStr = Object.prototype.toString;
        var isCallable = function isCallable(fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function toInteger(value) {
            var number = Number(value);
            if (isNaN(number)) {
                return 0;
            }
            if (number === 0 || !isFinite(number)) {
                return number;
            }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function toLength(value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };

        // The length property of the from method is 1.
        return function from(arrayLike /*, mapFn, thisArg */) {
            // 1. Let C be the this value.
            var C = this;

            // 2. Let items be ToObject(arrayLike).
            var items = Object(arrayLike);

            // 3. ReturnIfAbrupt(items).
            if (arrayLike == null) {
                throw new TypeError('Array.from requires an array-like object - not null or undefined');
            }

            // 4. If mapfn is undefined, then let mapping be false.
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                // 5. else
                // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                if (!isCallable(mapFn)) {
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                }

                // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }

            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            var len = toLength(items.length);

            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method
            // of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);

            // 16. Let k be 0.
            var k = 0;
            // 17. Repeat, while k < len… (also steps a - h)
            var kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k += 1;
            }
            // 18. Let putStatus be Put(A, "length", len, true).
            A.length = len;
            // 20. Return A.
            return A;
        };
    }();
}
// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
        value: function value(predicate) {
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }

            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
            var thisArg = arguments[1];

            // 5. Let k be 0.
            var k = 0;

            // 6. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kValue be ? Get(O, Pk).
                // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                // d. If testResult is true, return kValue.
                var kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                    return kValue;
                }
                // e. Increase k by 1.
                k++;
            }

            // 7. Return undefined.
            return undefined;
        }
    });
}
// https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
if (!Array.prototype.findIndex) {
    Object.defineProperty(Array.prototype, 'findIndex', {
        value: function value(predicate) {
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }

            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
            var thisArg = arguments[1];

            // 5. Let k be 0.
            var k = 0;

            // 6. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kValue be ? Get(O, Pk).
                // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                // d. If testResult is true, return k.
                var kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                    return k;
                }
                // e. Increase k by 1.
                k++;
            }

            // 7. Return -1.
            return -1;
        }
    });
}
// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function value(searchElement, fromIndex) {

            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            // 1. Let O be ? ToObject(this value).
            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If len is 0, return false.
            if (len === 0) {
                return false;
            }

            // 4. Let n be ? ToInteger(fromIndex).
            //    (If fromIndex is undefined, this step produces the value 0.)
            var n = fromIndex | 0;

            // 5. If n ≥ 0, then
            //  a. Let k be n.
            // 6. Else n < 0,
            //  a. Let k be len + n.
            //  b. If k < 0, let k be 0.
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return x === y || typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y);
            }

            // 7. Repeat, while k < len
            while (k < len) {
                // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                // b. If SameValueZero(searchElement, elementK) is true, return true.
                if (sameValueZero(o[k], searchElement)) {
                    return true;
                }
                // c. Increase k by 1.
                k++;
            }

            // 8. Return false
            return false;
        }
    });
}
// https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach
if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (var i = 0; i < this.length; i++) {
            callback.call(thisArg, this[i], i, this);
        }
    };
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (typeof Object.assign != 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
        value: function assign(target, varArgs) {
            // .length of function is 2
            'use strict';

            if (target == null) {
                // TypeError if undefined or null
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource != null) {
                    // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
        writable: true,
        configurable: true
    });
}
"use strict";

/* exported okanjo */

//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
/**
 * Okanjo widget framework namespace
 * @global okanjo
 */
var okanjo = function (window, document) {

    //region Constants

    // Environment Vars
    var SUPPORTS_PAGE_OFFSET = window.pageXOffset !== undefined;
    var CSS1_COMPATIBLE = (document.compatMode /* istanbul ignore next: out of scope */ || "") === "CSS1Compat";
    var AGENT = window.navigator.userAgent;
    var ELLIPSIFY_PATTERN = /[\s\S](?:\.\.\.)?$/;
    var MOBILE_PATTERN = /(iPhone|iPad|iPod|Android|blackberry)/i;
    var NOOP = function NOOP() {};
    var Console = window.console;

    // Place to pull defaults, if already set
    var settings = window.okanjo || {};

    //endregion

    //region Okanjo Core


    //noinspection JSValidateJSDoc,JSClosureCompilerSyntax - idk phpStorm generated it so why would it be wrong? :P
    /**
     * Okanjo namespace
     * @global
     * @type {{version: string, metrics: null, key: null, report: ((...p1?:*[])), warn: ((p1?:*, ...p2?:*[])), qwery: ((p1?:*, p2?:*))}}
     */
    var okanjo = {

        /**
         * Okanjo version
         */
        version: "1.5.3",

        /**
         * Placeholder
         */
        metrics: null,

        /**
         * Global/default placement key
         */
        key: settings.key || null,

        /**
         * Reports an error to the console and possibly Raven in the future
         * @param args
         */
        report: function report() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var err = args.find(function (arg) {
                return arg instanceof Error;
            });
            if (!err) {
                var messageIndex = args.findIndex(function (arg) {
                    return typeof arg === "string";
                });
                err = new Error(args[messageIndex] || "Okanjo Error");
                if (messageIndex >= 0) args.splice(messageIndex, 1);
            } else {
                // Grow our own stack so we can figure out what async thing did it
                var stack = new Error().stack.split('\n');
                stack.shift();
                stack.shift();
                args.push({ reportStack: stack.join('\n') });
                args = args.filter(function (a) {
                    return a !== err;
                });
            }

            Console.error('[Okanjo v' + okanjo.version + ']: ' + err.stack);
            args.length && Console.error.apply(Console, ['Additional information:'].concat(args));

            // TODO - integrate with Raven
        },

        /**
         * Warn developers of their misdeeds
         * @param message
         * @param args
         */
        warn: function warn(message) {
            for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
            }

            var err = new Error(message);

            Console.warn('[Okanjo v' + okanjo.version + ']: ' + err.stack);
            args.length && Console.warn.apply(Console, ['Additional information:'].concat(args));
        },

        // Backwards compatibility when we shipped with qwery, cuz querySelector[All] wasn't mainstream enough
        qwery: function qwery(selector, parent) {

            // If parent is a selector, select the parent first!
            if (typeof parent === "string") {
                parent = document.querySelector(parent);

                // If parent is not found, there are obviously no results
                if (!parent) return [];
            }

            if (!parent) parent = document;

            return parent.querySelectorAll(selector);
        }
    };

    //endregion

    //region Vendor Libs

    /**
     * Placeholder for where vendor libraries get no-conflict loaded
     * @type {{}}
     */
    okanjo.lib = {};

    //endregion

    //region Networking

    /**
     * Networking methods
     * @type {{getRoute: *, exec: *}}
     */
    okanjo.net = {

        /**
         * API Endpoints
         */
        endpoint: 'https://api2.okanjo.com',
        sandboxEndpoint: 'https://sandbox-api2.okanjo.com',

        /**
         * API routes
         */
        routes: {
            ads: '/content',
            metrics: '/metrics/:object_type/:event_type',
            metrics_batch: '/metrics'
        },

        /**
         * Compiles a route and parameters into a final URL
         * @param {string} route - Route constant
         * @param {*} [params] - Key value hash
         * @param {*} [env] - Optional environment to use instead of live
         * @return {string} - Route
         */
        getRoute: function getRoute(route, params, env) {
            if (params) {
                Object.keys(params).forEach(function (key) {
                    route = route.replace(':' + key, params[key] + "");
                });
            }
            env = env || okanjo.env || 'live';
            return (env === 'sandbox' ? okanjo.net.sandboxEndpoint : okanjo.net.endpoint) + route;
        },

        // placeholder, xhr request extension
        request: NOOP
    };

    //endregion

    // region Utilities

    //noinspection JSClosureCompilerSyntax,JSValidateJSDoc
    /**
     * Utility functions and helpers
     * @type {{isEmpty: ((p1?:*)=>boolean), isMobile: (()), getPageArguments: ((p1:boolean))}}
     */
    okanjo.util = {

        /**
         * Checks whether a value is _really_ empty (trims)
         * @param val
         * @return {boolean}
         */
        isEmpty: function isEmpty(val) {
            return val === null || val === undefined || typeof val === "string" && val.trim().length === 0;
        },

        /**
         * Checks if the current user agent identifies as a mobile device
         * @returns {boolean}
         */
        isMobile: function isMobile() {
            // KludgyAF™, but let's go with it
            return MOBILE_PATTERN.test(AGENT);
        },

        /**
         * Returns an object hashmap of query and hash parameters
         * @param {boolean} includeHashArguments - Whether to include the hash arguments, if any
         * @return {*}
         */
        getPageArguments: function getPageArguments(includeHashArguments) {

            var split = function split(query) {
                query = query || "";
                var params = {};
                var parts = query.split('&');
                parts.forEach(function (part) {
                    var eqIndex = part.indexOf('=');
                    var key = void 0,
                        value = void 0;
                    if (eqIndex < 0) {
                        key = decodeURIComponent(part);
                        value = null;
                    } else {
                        key = decodeURIComponent(part.substring(0, eqIndex));
                        value = decodeURIComponent(part.substring(eqIndex + 1));
                    }
                    if (key) params[key] = value;
                });
                return params;
            };

            var queryArgs = split(window.location.search.substring(window.location.search.indexOf('?') + 1));
            var hashArgs = includeHashArguments ? split(window.location.hash.substring(Math.max(window.location.hash.indexOf('#') + 1, window.location.hash.indexOf('#!') + 2))) : {};
            Object.keys(hashArgs).forEach(function (key) {
                return queryArgs[key] = hashArgs[key];
            });

            return queryArgs;
        }

    };

    /**
     * Deep clones an object by breaking references, unlike Object.assign
     * @param mixed – Source to clone (object, array, value)
     * @param [out] - Existing output, if any
     * @return {*}
     */
    okanjo.util.deepClone = function (mixed, out) {
        if (Array.isArray(mixed)) {
            // Array reference
            out = out || [];
            out = out.concat(mixed.map(function (val) {
                return okanjo.util.deepClone(val);
            }));
        } else if ((typeof mixed === 'undefined' ? 'undefined' : _typeof(mixed)) === "object" && mixed !== null) {
            // Object reference
            out = out || {};
            Object.keys(mixed).forEach(function (key) {
                out[key] = okanjo.util.deepClone(mixed[key]);
            });
        } else {
            // Value
            out = mixed;
        }

        return out;
    };

    /**
     * Flattens a multi-dimensional object into a single object
     * @param input
     * @param [options]
     * @return {{}}
     */
    okanjo.util.flatten = function (input) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var output = {};

        if (input !== undefined && input !== null) {
            Object.keys(input).forEach(function (key) {
                // Convert object ids to hex strings
                if (input[key] instanceof Date) {
                    if (options.dateToIso) {
                        output[key] = input[key].toISOString(); // convert to iso
                    } else {
                        output[key] = input[key]; // as-is
                    }
                } else if (_typeof(input[key]) === 'object' && input[key] !== null) {
                    // Allow ignoring arrays if desired
                    if (Array.isArray(input[key]) && options.ignoreArrays === true) {
                        output[key] = input[key];
                    } else if (Array.isArray(input[key]) && options.arrayToCsv === true) {
                        output[key] = input[key].join(',');
                    } else {
                        // Make child objects flat too (always returns object so Object.keys is safe)
                        var childObject = okanjo.util.flatten(input[key], options);
                        Object.keys(childObject).forEach(function (childKey) {
                            output[key + '_' + childKey] = childObject[childKey];
                        });
                    }
                } else {
                    // Copy value references
                    output[key] = input[key];
                }
            });
        }

        return output;
    };

    /*! based on shortid https://github.com/dylang/shortid */
    okanjo.util.shortid = function (clusterWorkerId) {

        var shuffled = 'ylZM7VHLvOFcohp01x-fXNr8P_tqin6RkgWGm4SIDdK5s2TAJebzQEBUwuY9j3aC',
            crypto = window.crypto || window.msCrypto || typeof require === "function" && require('crypto'),
            randomByte = function randomByte() {
            /* istanbul ignore next: platform diffs out of scope */
            if (crypto && crypto.randomBytes) {
                return crypto.randomBytes(1)[0] & 0x30;
            } else if (!crypto || !crypto.getRandomValues) {
                return Math.floor(Math.random() * 256) & 0x30;
            }
            /* istanbul ignore next: platform diffs out of scope */
            var dest = new Uint8Array(1);
            /* istanbul ignore next: platform diffs out of scope */
            crypto.getRandomValues(dest);
            /* istanbul ignore next: platform diffs out of scope */
            return dest[0] & 0x30;
        },
            encode = function encode(number) {
            var loopCounter = 0,
                done = void 0,
                str = '';

            while (!done) {
                str = str + shuffled[number >> 4 * loopCounter & 0x0f | randomByte()];
                done = number < Math.pow(16, loopCounter + 1);
                loopCounter++;
            }
            return str;
        },


        // Ignore all milliseconds before a certain time to reduce the size of the date entropy without sacrificing uniqueness.
        // This number should be updated every year or so to keep the generated id short.
        // To regenerate `new Date() - 0` and bump the version. Always bump the version!

        REDUCE_TIME = 1490384907498,
            version = 7;

        var counter = void 0,
            previousSeconds = void 0;

        clusterWorkerId = clusterWorkerId || 0;

        return function () {
            var str = '',
                seconds = Math.floor((new Date().getTime() - REDUCE_TIME) * 0.001);

            if (seconds === previousSeconds) {
                counter++;
            } else {
                counter = 0;
                previousSeconds = seconds;
            }

            str = str + encode(version) + encode(clusterWorkerId);
            if (counter > 0) {
                str = str + encode(counter);
            }
            str = str + encode(seconds);

            return str;
        };
    }();

    //endregion

    //region User Interface

    okanjo.ui = {

        /**
         * Gets the current page scroll position
         * @returns {{x: Number, y: Number}}
         */
        getScrollPosition: function getScrollPosition() {
            return {
                x: SUPPORTS_PAGE_OFFSET ? window.pageXOffset : /* istanbul ignore next: old browsers */CSS1_COMPATIBLE ? document.documentElement.scrollLeft : document.body.scrollLeft,
                y: SUPPORTS_PAGE_OFFSET ? window.pageYOffset : /* istanbul ignore next: old browsers */CSS1_COMPATIBLE ? document.documentElement.scrollTop : document.body.scrollTop
            };
        },

        /**
         * Gets the height and width of the given element
         * @param {HTMLElement|Node} element – The DOM element to get the size of
         * @param {boolean} [includeMargin] – Whether to include the margins of the element in the size
         * @returns {{height: number, width: number}}
         */
        getElementSize: function getElementSize(element, includeMargin) {
            var size = {
                height: element.offsetHeight,
                width: element.offsetWidth
            };
            var style = element.currentStyle || window.getComputedStyle(element);

            if (includeMargin) {
                size.height += parseInt(style.marginTop) + parseInt(style.marginBottom);
                size.width += parseInt(style.marginLeft) + parseInt(style.marginRight);
            }

            return size;
        },

        /**
         * Gets the current page size
         * @return {{w: number, h: number}}
         */
        getPageSize: function getPageSize() {
            var body = document.querySelector('body');
            var html = document.documentElement;

            return {
                w: Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),

                h: Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
            };
        },

        /**
         * Gets the current viewport size
         * @return {{vw: number, vh: number}}
         */
        getViewportSize: function getViewportSize() {
            var element = CSS1_COMPATIBLE ? document.documentElement /* istanbul ignore next: browser diffs */ : document.body;
            var width = element.clientWidth;
            var height = element.clientHeight;
            var inWidth = window.innerWidth /* istanbul ignore next: browser diffs */ || 0;
            var inHeight = window.innerHeight /* istanbul ignore next: browser diffs */ || 0;
            var isMobileZoom = inWidth && width > inWidth || inHeight && height > inHeight;

            return {
                vw: isMobileZoom /* istanbul ignore next: browser diffs */ ? inWidth : width,
                vh: isMobileZoom /* istanbul ignore next: browser diffs */ ? inHeight : height
            };
        },

        /**
         * Gets the x, y location of the event relative to the page
         * @param event – Mouse/Touch Event
         * @return {{ex: number, ey: number}}
         */
        getEventPosition: function getEventPosition(event) {
            var ex = event.pageX;
            var ey = event.pageY;
            var body = document.body;
            var el = document.documentElement;
            var scrollLeft = 'scrollLeft';
            var scrollTop = 'scrollTop';
            var type = event.__proto__.constructor.name;

            return {
                et: type, // mouse? touch? keyboard? robot?
                ex: ex === undefined /* istanbul ignore next: browser diffs */ ? event.clientX + body[scrollLeft] + el[scrollLeft] : ex,
                ey: ey === undefined /* istanbul ignore next: browser diffs */ ? event.clientY + body[scrollTop] + el[scrollTop] : ey
            };
        },

        /**
         * Gets the element's rectangle coordinates on the page
         * @param element
         * @return {{x1: number, y1: number, x2: number, y2: number}}
         */
        getElementPosition: function getElementPosition(element) {

            // Wrapped in try-catch because IE is super strict about the
            // element being on the DOM before you call this. Other browsers
            // let it slide, but oh well.

            var err = 'Could not get position of element. Did you attach the element to the DOM before initializing?';
            try {
                var rect = element.getBoundingClientRect();
                var body = document.body.getBoundingClientRect();
                // let pos = okanjo.ui.getScrollPosition();

                /* istanbul ignore else: jsdom doesn't mock this */
                if (!document.body.contains(element)) {
                    okanjo.report(err, element);
                }
                return {
                    // x1: rect.left + pos.x,
                    // y1: rect.top + pos.y,
                    // x2: rect.right + pos.x,
                    // y2: rect.bottom + pos.y

                    // This might fix
                    x1: rect.left - body.left,
                    y1: rect.top - body.top,
                    x2: rect.right - body.left,
                    y2: rect.bottom - body.top

                };
            } catch (e) {
                okanjo.report(err, { exception: e, element: element });
                return {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 0,
                    err: 1
                };
            }
        },

        /**
         * Gets the intersection information given the element, viewport and scroll positions
         * @param e – Element position
         * @param s - Scroll position
         * @param v - Viewport size
         * @return {{intersectionArea: number, elementArea: number}}
         * @private
         */
        _getIntersection: function _getIntersection(e, s, v) {
            var iLeft = Math.max(e.x1, s.x),
                iRight = Math.min(e.x2, s.x + v.vw),
                iTop = Math.max(e.y1, s.y),
                iBottom = Math.min(e.y2, s.y + v.vh),
                intersectionArea = Math.max(0, iRight - iLeft) * Math.max(0, iBottom - iTop),
                elementArea = (e.x2 - e.x1) * (e.y2 - e.y1);

            return {
                intersectionArea: intersectionArea,
                elementArea: elementArea
            };
        },

        /**
         * Gets the percentage of the element pixels currently within the viewport
         * @param {HTMLElement|Node} element
         * @return {number}
         */
        getPercentageInViewport: function getPercentageInViewport(element) {
            var e = okanjo.ui.getElementPosition(element),
                s = okanjo.ui.getScrollPosition(),
                v = okanjo.ui.getViewportSize();

            // If there was a problem getting the element position, fail fast
            if (e.err) return 0;

            // Get intersection rectangle

            var _okanjo$ui$_getInters = okanjo.ui._getIntersection(e, s, v),
                intersectionArea = _okanjo$ui$_getInters.intersectionArea,
                elementArea = _okanjo$ui$_getInters.elementArea;

            // Don't let it return NaN
            /* istanbul ignore else: jsdom no love positional data */


            if (elementArea <= 0) return 0;

            /* istanbul ignore next: jsdom no love positional data, area tested with helper fn tho */
            return intersectionArea / elementArea;
        }
    };

    /**
     * Splits the text in the element to fit within the visible height of its container, and separates with an ellipses
     * @param {HTMLElement|Node} element – The DOM element containing the text to fit
     * @param {HTMLElement} [container] – Optional container to compute fit on. Defaults to the element's parent
     */
    okanjo.ui.ellipsify = function (element, container) {

        // It's a sad day when you have to resort to JS because CSS kludges are too hacky to work down to IE8, programmatically

        //noinspection JSValidateTypes
        var parent = container || element.parentNode,
            targetHeight = okanjo.ui.getElementSize(parent).height,
            useTextContent = element.textContent !== undefined;

        var text = useTextContent ? element.textContent /* istanbul ignore next: browser diffs */ : element.innerText,
            replacedText = "",
            safety = 5000,
            // Safety switch to bust out of the loop in the event something goes terribly wrong
        replacer = function replacer(match) {
            /* istanbul ignore next: n/a to jsdom */
            replacedText = match.substr(0, match.length - 3) + replacedText;
            /* istanbul ignore next: n/a to jsdom */
            return '...';
        };

        // Trim off characters until we can fit the text and ellipses
        // If the text already fits, this loop is ignored
        /* istanbul ignore next: jsdom doesn't do element size computing stuff */
        while (okanjo.ui.getElementSize(element).height > targetHeight && text.length > 0 && safety-- > 0) {
            text = useTextContent ? element.textContent : element.innerText;

            text = text.replace(ELLIPSIFY_PATTERN, replacer);

            if (useTextContent) {
                element.textContent = text;
            } else {
                element.innerText = text;
            }
        }

        // If there is work to do, split the content into two span tags
        // Like so: [content]...[hidden content]
        /* istanbul ignore if: n/a to jsdom */
        if (replacedText.length > 0) {

            var content = document.createElement('span'),
                span = document.createElement('span');

            content.setAttribute('class', 'okanjo-ellipses');
            span.setAttribute('class', 'okanjo-visually-hidden');

            if (useTextContent) {
                content.textContent = text.substr(0, text.length - 3);
                span.textContent = replacedText;
            } else {
                content.innerText = text.substr(0, text.length - 3);
                span.innerText = replacedText;
            }

            element.innerHTML = '';
            element.appendChild(content);
            element.appendChild(span);
        }
    };

    //endregion

    // Export the root namespace
    return window.okanjo = okanjo;
}(window, document);
"use strict";

(function (window) {

    var JSON_TEST = /^application\/json/;
    var okanjo = window.okanjo;

    /**
     * Performs a reliable XHR request
     * @param {string} method - Request method
     * @param {string} url - URL
     * @param [payload] optional payload
     * @param callback Fired on when completed (err, res), normalized to standard response format
     */
    okanjo.net.request = function (method, url, payload, callback) {

        // payload is not required
        if (typeof payload === "function") {
            callback = payload;
            payload = undefined;
        }

        // Create a new instance
        var req = new (window.XMLHttpRequest /* istanbul ignore next: old ie */ || window.ActiveXObject)('MSXML2.XMLHTTP.3.0');

        // Flag to prevent duplicate callbacks / races
        var calledBack = false;

        // Normalized done handler
        var done = function done(err, res) {
            /* istanbul ignore else: out of scope */
            if (!calledBack) {
                calledBack = true;
                callback(err, res);
            }
        };

        // Apply timeout if configured globally
        if (okanjo.net.request.timeout) {
            req.timeout = okanjo.net.request.timeout;
        }

        // Catch timeout errors
        req.ontimeout = function (e) {
            /* istanbul ignore next: idk if jsdom can mock this, also readystatechange may fire before this anyway */
            done({
                statusCode: 504,
                error: "Request timed out",
                message: 'Something went wrong',
                attributes: {
                    event: e,
                    xhr: req
                }
            });
        };

        // Handle the response
        req.onreadystatechange = function (e) {
            // 4 = completed / failed
            if (req.readyState === 4) {
                // Do we have a response?
                if (req.status > 0) {
                    var res = void 0;

                    // Check if we got JSON and parse it right away
                    if (JSON_TEST.test(req.getResponseHeader('Content-Type'))) {
                        res = JSON.parse(req.responseText);
                    } else {
                        // Not JSON, normalize it instead
                        res = {
                            statusCode: req.status,
                            data: req.responseText
                        };
                    }

                    // Put the response in the proper slot (err for non success responses)
                    if (req.status >= 200 && req.status < 300) {
                        done(null, res);
                    } else {
                        done(res);
                    }
                } else {
                    // Request failed - e.g. CORS or network issues
                    done({
                        statusCode: 503,
                        error: "Request failed",
                        message: 'Something went wrong',
                        attributes: {
                            event: e,
                            xhr: req
                        }
                    });
                }
            }
        };

        // Open the request
        req.open(method.toUpperCase(), url);

        // Include credentials
        req.withCredentials = true;

        // Handle post payloads
        if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
            req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
            if (payload !== undefined) {
                payload = JSON.stringify(payload);
            }
        }

        // Ship it
        req.send(payload || undefined);
    };

    // Bind helpers to make things easy as pie
    okanjo.net.request.get = okanjo.net.request.bind(this, 'GET');
    okanjo.net.request.post = okanjo.net.request.bind(this, 'POST');
    okanjo.net.request.put = okanjo.net.request.bind(this, 'PUT');
    okanjo.net.request.delete = okanjo.net.request.bind(this, 'DELETE');

    /**
     * Helper to aid in minificiation+querystringify and redundant encodeURIComponent stuff
     * @param val
     * @return {*}
     */
    var encode = function encode(val) {
        if (val === null || val === undefined) return '';
        return encodeURIComponent('' + val);
    };

    /**
     * Helper to aid in getting a query string key using a prefix and keyname
     * @param key
     * @param keyPrefix
     * @return {*}
     */
    var getKey = function getKey(key, keyPrefix) {
        if (keyPrefix) {
            return keyPrefix + '[' + encode(key) + ']';
        } else {
            return encode(key);
        }
    };

    /**
     * Super basic querystringify helper. It handles deep objects, but not for array values
     * @param obj
     * @param [keyPrefix]
     * @return {string}
     */
    okanjo.net.request.stringify = function (obj, keyPrefix) {
        var pairs = [];
        keyPrefix = keyPrefix || "";
        Object.keys(obj).forEach(function (key) {
            var value = obj[key];
            if (Array.isArray(value)) {
                value.forEach(function (v) {
                    return pairs.push(getKey(key, keyPrefix) + '=' + encode(v));
                }); // Does not do that PHP garbage with key[]=val
            } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === "object" && value !== null) {
                // Recurse
                var res = okanjo.net.request.stringify(value, getKey(key, keyPrefix));
                if (res) pairs.push(res);
            } else if (value !== undefined) {
                pairs.push(getKey(key, keyPrefix) + '=' + encode(value));
            }
        });
        return pairs.join('&');
    };
})(window);
"use strict";

//noinspection ThisExpressionReferencesGlobalObjectJS
(function (window, document) {

    /**
     * Okanjo cookie utility helpers
     */
    window.okanjo.util.cookie = {

        /**
         * Sets a cookie
         * @param cookieName
         * @param value
         * @param expireDays
         */
        set: function set(cookieName, value, expireDays) {
            var expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + expireDays);
            var expires = expireDays ? " Expires=" + expireDate.toUTCString() + ";" : "";
            var path = " Path=/";
            var cookieValue = encodeURI(value) + ';' + expires + path;
            document.cookie = cookieName + "=" + cookieValue;
        },

        /**
         * Gets a cookie
         * @param cookieName
         * @return {*}
         */
        get: function get(cookieName) {
            var output = null;
            document.cookie.split(";").find(function (cookie) {
                var nameTest = cookie.substr(0, cookie.indexOf("=")).trim();
                var value = cookie.substr(cookie.indexOf("=") + 1);
                if (nameTest === cookieName) {
                    output = decodeURI(value);
                    return true;
                } else {
                    return false;
                }
            });
            return output;
        }
    };
})(window, document);
"use strict";

//noinspection JSUnusedLocalSymbols,ThisExpressionReferencesGlobalObjectJS
(function (window, document) {

    var okanjo = window.okanjo;

    /**
     * UI Rendering Engine
     */

    var TemplateEngine = function () {
        function TemplateEngine() {
            _classCallCheck(this, TemplateEngine);

            // Load initial templates from options
            this._templates = {};
            this._css = {};

            // Hook point for adding custom styles to ui elements
            this.classDetects = '';
        }

        /**
         * Registers a template for use
         * @param name
         * @param template
         * @param beforeRender
         * @param options
         */


        _createClass(TemplateEngine, [{
            key: 'registerTemplate',
            value: function registerTemplate(name, template, beforeRender, options) {

                if ((typeof template === 'undefined' ? 'undefined' : _typeof(template)) === "object") {
                    //noinspection JSValidateTypes
                    if (template.nodeType === undefined) {
                        throw new Error('Parameter template must be a string or a DOM element');
                    } else {
                        template = template.innerHTML;
                        okanjo.lib.Mustache.parse(template);
                    }
                } else if (typeof template !== "string") {
                    throw new Error('Parameter template must be a string or a DOM element');
                }

                // Shift options if only have 3 params
                if (arguments.length === 3 && (typeof beforeRender === 'undefined' ? 'undefined' : _typeof(beforeRender)) === "object") {
                    options = beforeRender;
                    beforeRender = null;
                } else {
                    options = options || {};
                }

                if (beforeRender && typeof beforeRender !== "function") {
                    throw new Error('Parameter beforeRender must be a function');
                }

                // Assign the template
                this._templates[name] = {
                    markup: template,
                    options: options,
                    beforeRender: beforeRender
                };
            }

            /**
             * Registers a CSS payload for use
             * @param name
             * @param css
             * @param options
             */

        }, {
            key: 'registerCss',
            value: function registerCss(name, css, options) {
                options = options || {};

                if ((typeof css === 'undefined' ? 'undefined' : _typeof(css)) === "object") {
                    //noinspection JSValidateTypes
                    if (css.nodeType === undefined) {
                        throw new Error('Parameter css must be a string or a DOM element');
                    }
                } else if (typeof css !== "string") {
                    throw new Error('Parameter css must be a string or a DOM element');
                }

                this._css[name] = {
                    markup: css,
                    options: options
                };
            }

            /**
             * Checks whether a template is registered
             * @param name
             * @return {boolean}
             */

        }, {
            key: 'isTemplateRegistered',
            value: function isTemplateRegistered(name) {
                return !!this._templates[name];
            }

            //noinspection JSUnusedGlobalSymbols
            /**
             * Checks whether a CSS payload is registered
             * @param name
             * @return {boolean}
             */

        }, {
            key: 'isCssRegistered',
            value: function isCssRegistered(name) {
                return !!this._css[name];
            }

            /**
             * Ensures that a CSS payload has been added to the DOM
             * @param name
             */

        }, {
            key: 'ensureCss',
            value: function ensureCss(name) {
                if (this._css[name]) {
                    //noinspection JSValidateTypes
                    var css = this._css[name],
                        id = css.markup.nodeType === undefined ? css.options.id || "okanjo-css-" + name : null; // If it's a DOM element, just forget it cuz it's already on the page

                    // Check for css element on page, if we have an ID to look for
                    if (id) {
                        var element = document.querySelector('#' + id.replace(/\./g, '\\.'));
                        if (!element) {
                            var head = document.head,
                                style = document.createElement('style');

                            style.id = id;
                            style.setAttribute('type', 'text/css');

                            /* istanbul ignore else: old ie */
                            if (style.hasOwnProperty) {
                                // old ie
                                style.innerHTML = css.markup;
                            } else {
                                style.styleSheet.cssText = css.markup;
                            }

                            if (head) {
                                head.appendChild(style);
                            } else {
                                // NO HEAD, just prepend to body then
                                var body = document.body;
                                if (body) {
                                    body.appendChild(style);
                                } else {
                                    // And if this doesn't work, just give up
                                    okanjo.report('Cannot add CSS template to document. Does it not have a body or head?');
                                }
                            }
                        }
                    }
                } else {
                    okanjo.report('Attempted to add CSS template "' + name + '" to the DOM, however it does not appear to be registered?');
                }
            }

            /**
             * Renders a template and returns the markup
             * @param templateName
             * @param context
             * @param model
             * @return {string}
             */

        }, {
            key: 'render',
            value: function render(templateName, context, model) {
                var _this = this;

                model = model || {};
                var template = this._templates[templateName];

                // If there's a data controller closure set, and if so, run the data through there
                if (template.beforeRender) {
                    model = template.beforeRender.call(context, model);
                }

                // Attach globals
                model.okanjo = okanjo;
                model.okanjoMetricUrl = okanjo.net.endpoint.replace(/^https?:\/\//, ''); // Url w/o scheme to prevent mixed-content warnings
                model.now = function () {
                    return new Date().getTime();
                };
                model.classDetects = this.classDetects;

                //noinspection JSUnresolvedVariable
                if (model.blockClasses && Array.isArray(model.blockClasses)) {
                    model.classDetects += " " + model.blockClasses.join(' ');
                    delete model.blockClasses;
                }

                // Add CSS unless we are told not to
                if (model.css !== false && template.options.css && template.options.css.length > 0) {
                    template.options.css.forEach(function (css) {
                        return _this.ensureCss(css);
                    });
                    delete model.css;
                }

                // Render the template and return the result
                return okanjo.lib.Mustache.render(template.markup, model);
            }
        }]);

        return TemplateEngine;
    }();

    /**
     * Formats a number into a currency string (rounded, decimal points, thousands separators)
     * See: http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
     *
     * @param value – the number to format
     * @param [decimals] - The number of decimals to show
     * @param [decimalSeparator] – The decimals separator, default: .
     * @param [thousandsSeparator] – The thousands separator, default: ,
     * @returns {string} – Formatted currency string
     */


    TemplateEngine.formatCurrency = function (value) {
        var decimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
        var decimalSeparator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '.';
        var thousandsSeparator = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ',';

        var s = value < 0 ? "-" : "",
            i = parseInt(value = Math.abs(+value || 0).toFixed(decimals)) + "";
        var j = i.length;
        j = j > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + thousandsSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousandsSeparator) + (decimals ? decimalSeparator + Math.abs(value - i).toFixed(decimals).slice(2) : "");
    };

    // Export
    okanjo.ui.engine = new TemplateEngine();
})(window, document);
"use strict";

//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function (window, document) {

    /*
      div .modal-container .fade-out .hidden
     | div .modal-window .clearfix
     | |
     | | div .modal-window-skin
     | | | div .modal-window-outer
     | | | | div .modal-window-inner
     | | | | | iframe .okanjo-inline-buy-frame
     | | | | /div
     | | | /div
     | | /div
     | |
     | | div .close-button
     | | | ×
     | | /div
     | |
     | /div
     /div
      */

    var okanjo = window.okanjo;
    var IS_MOBILE = okanjo.util.isMobile();

    var initialized = false,

    // scrollY = null,

    // Selectors
    $html = void 0,
        $body = void 0,
        $modalContainer = void 0,
        $modalWindow = void 0,
        $modalSkin = void 0,
        $modalOuter = void 0,
        $modalInner = void 0,
        $modalClose = void 0,
        $modalFrame = void 0,
        createElements = function createElements() {

        // Page elements
        //noinspection JSUnresolvedFunction
        $html = document.documentElement /* istanbul ignore next: old browsers */ || document.querySelector('html');
        //noinspection JSUnresolvedFunction
        $body = document.body /* istanbul ignore next: old browsers */ || document.querySelector('body');

        // Modal elements
        $modalContainer = document.createElement('div');
        $modalWindow = document.createElement('div');
        $modalSkin = document.createElement('div');
        $modalOuter = document.createElement('div');
        $modalInner = document.createElement('div');
        $modalClose = document.createElement('div');
        $modalFrame = document.createElement('iframe');

        $modalContainer.setAttribute('class', 'okanjo-modal-container okanjo-modal-hidden ' /*+ okanjo.util.detectClasses().join(' ')*/);
        $modalWindow.setAttribute('class', 'okanjo-modal-window');
        $modalSkin.setAttribute('class', 'okanjo-modal-window-skin');
        $modalOuter.setAttribute('class', 'okanjo-modal-window-outer');
        $modalInner.setAttribute('class', 'okanjo-modal-window-inner');
        $modalClose.setAttribute('class', 'okanjo-modal-close-button');

        $modalFrame.setAttribute('class', 'okanjo-inline-buy-frame');
        $modalFrame.setAttribute('frameborder', '0');
        $modalFrame.setAttribute('vspace', '0');
        $modalFrame.setAttribute('hspace', '0');
        $modalFrame.setAttribute('webkitallowfullscreen', '');
        $modalFrame.setAttribute('mozallowfullscreen', '');
        $modalFrame.setAttribute('allowfullscreen', '');
        $modalFrame.setAttribute('scrolling', 'auto');

        $modalClose.innerHTML = '×';

        // Create the modal element tree
        $modalInner.appendChild($modalFrame);
        $modalOuter.appendChild($modalInner);
        $modalSkin.appendChild($modalOuter);
        $modalWindow.appendChild($modalSkin);
        $modalWindow.appendChild($modalClose);
        $modalContainer.appendChild($modalWindow);

        // Add the modal stuff to the body
        $body.appendChild($modalContainer);
    },
        addListener = function addListener(el, event, handler) {
        /* istanbul ignore else: old browsers */
        if (el.addEventListener) {
            el.addEventListener(event, handler, false);
        } else {
            el.attachEvent("on" + event, handler);
        }
    },
        getWindowHeight = function getWindowHeight() {
        return window.innerHeight /* istanbul ignore next: old browsers */ || document.documentElement.clientHeight;
    },
        handleReposition = function handleReposition() {
        // scrollY = okanjo.ui.getScrollPosition().y;
        //$modalWindow.style.marginTop = scrollY + 40 + "px";
        $modalWindow.style.height = getWindowHeight() - 80 + "px";
    },
        bindEvents = function bindEvents() {

        // If the device orientation changes, adjust the modal view port
        addListener(window, 'orientationchange', function () {
            for (var t = 0; t < 2; t++) {
                setTimeout(handleReposition, 1000 * t + 10);
            }
        });

        // If the window changes size, also adjust the modal view port
        addListener(window, 'resize', function () {
            setTimeout(handleReposition, 100);
        });

        // Click the overlay to close the modal
        addListener($modalContainer, 'click', closeModal);

        // If you click in the modal, don't close it!
        addListener($modalWindow, 'click', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        // Click the close button to close it
        addListener($modalClose, 'click', function (e) {

            // Don't close it twice
            e.preventDefault();
            e.stopPropagation();

            closeModal();
        });
    },


    //removeListener = function(el, event, handler) {
    //    if (el.removeEventListener) {
    //        el.removeEventListener(event, handler);
    //    } else {
    //        el.detachEvent("on" + event, handler);
    //    }
    //},

    addClass = function addClass(el, name) {
        el.className += " " + name;
    },
        removeClass = function removeClass(el, name) {
        el.className = el.className.replace(new RegExp(' *?' + name), '');
    },
        openModal = function openModal() {

        // scrollY = document.body.scrollTop;

        removeClass($modalContainer, 'okanjo-modal-hidden');
        addClass($modalContainer, 'okanjo-modal-fade-out');

        handleReposition();

        addClass($html, "okanjo-modal-active");

        if (!IS_MOBILE) {
            addClass($html, "okanjo-modal-margin-fix");
        }

        setTimeout(function () {
            removeClass($modalContainer, 'okanjo-modal-fade-out');
        }, 10);

        // Click the overlay to close the modal
        //addListener($body, 'click', closeModal);
    },
        closeModal = function closeModal() {
        addClass($modalContainer, 'okanjo-modal-fade-out');

        setTimeout(function () {
            removeClass($modalContainer, 'okanjo-modal-fade-out');
            addClass($modalContainer, "okanjo-modal-hidden");

            removeClass($html, "okanjo-modal-active");
            if (!IS_MOBILE) {
                removeClass($html, "okanjo-modal-margin-fix");
            }
        }, 210);

        // Click the overlay to close the modal
        //removeListener($body, 'click', closeModal);
    },


    /**
     * Insert an element or markup into the modal
     * @param content
     */
    setContent = function setContent(content) {

        // Remove existing content
        $modalInner.innerHTML = "";

        // Insert new content
        if (typeof content === "string") {
            $modalInner.innerHTML = content;
        } else {
            $modalInner.appendChild(content);
        }
    };

    // Expose the modal functions
    okanjo.ui.modal = {

        show: function show(content) {

            if (!initialized) {
                initialized = true;
                createElements();
                bindEvents();
            }

            setContent(content);
            openModal();
        },

        hide: function hide() {
            closeModal();
        }

    };

    return okanjo.ui.modal;
})(window, document);
"use strict";

//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function (window, document) {

    var okanjo = window.okanjo;

    /**
     * Event tracking class
     * @type {Metrics}
     */

    var Metrics = function () {

        //noinspection JSUnusedGlobalSymbols
        function Metrics() {
            _classCallCheck(this, Metrics);

            /**
             * Events queued here before submission
             * @type {Array}
             * @private
             */
            this._queue = this._getStoredQueue();
            this._processTimeout = null; // queue event loop timeout pointer

            /**
             * Unique page grouping event identifier
             */
            this.pageId = okanjo.util.shortid();
            this.defaultChannel = Metrics.Channel.external;

            this.sid = null;
            this.sourceCh = null;
            this.sourceCx = null;

            // Extract referral data, if set
            this._checkUrlForReferral();

            // TODO - look into iframe session correlation system
        }

        //noinspection JSMethodCanBeStatic
        /**
         * Gets the storage backed metric queue, in case we did not send everything last time
         * @return {Array}
         * @private
         */


        _createClass(Metrics, [{
            key: '_getStoredQueue',
            value: function _getStoredQueue() {
                if (window.localStorage[Metrics.Params.queue]) {
                    try {
                        var queue = JSON.parse(window.localStorage[Metrics.Params.queue]);
                        if (Array.isArray(queue)) {
                            return queue;
                        } else {
                            okanjo.report('Stored queue is not a queue', { queue: queue });
                            return [];
                        }
                    } catch (e) {
                        okanjo.report('Failed to load metric queue from storage', { err: e });
                        return [];
                    }
                } else {
                    // not stored
                    return [];
                }
            }

            /**
             * Updates the queue stored in storage, in the event we can't complete our submissions
             * @param delay - Whether to delay updating the queue for a bit, to let other metrics pile in
             * @private
             */

        }, {
            key: '_saveQueue',
            value: function _saveQueue(delay) {
                var _this2 = this;

                if (delay) {
                    if (this._saveQueueTimeout) clearTimeout(this._saveQueueTimeout);
                    this._saveQueueTimeout = setTimeout(function () {
                        _this2._saveQueue(false);
                        _this2._saveQueueTimeout = null;
                    }, 100);
                } else {
                    window.localStorage[Metrics.Params.queue] = JSON.stringify(this._queue);
                }
            }

            /**
             * Extract contextual pass-through data from the URL, if present
             * @private
             */

        }, {
            key: '_checkUrlForReferral',
            value: function _checkUrlForReferral() {
                var pageArgs = okanjo.util.getPageArguments(true),
                    urlSid = pageArgs[Metrics.Params.name],
                    localSid = window.localStorage[Metrics.Params.name] || okanjo.util.cookie.get(Metrics.Params.name),
                    // pull from storage or cookie
                sourceContext = pageArgs[Metrics.Params.context],
                    sourceChannel = pageArgs[Metrics.Params.channel];

                // If for some reason, both are set, record the incident as a possible correlation
                if (urlSid && localSid && urlSid !== localSid) {
                    this.trackEvent({
                        object_type: Metrics.Object.metric_session,
                        event_type: Metrics.Event.correlation,
                        id: urlSid + "_" + localSid,
                        ch: this.defaultChannel,
                        _noProcess: true
                    });
                }

                // Update local values
                this.sid = localSid || urlSid || null; // prefer local over remote (changed in 1.0)
                this.sourceCh = sourceChannel || null;
                this.sourceCx = sourceContext || null;
            }

            /**
             * Submits an individual event metric
             * @param event
             * @param callback
             */

        }, {
            key: 'trackEvent',
            value: function trackEvent(event, callback) {
                // Ensure the event contains the required fields
                if (!event.object_type || !event.event_type) {
                    okanjo.report('Invalid metric to track (missing object_type or event_type)', { event: event });
                    return;
                }

                // Queue the event for publishing
                this._push(event, callback);
            }

            //noinspection JSUnusedGlobalSymbols
            /**
             * Submits a page view metric
             * @param event
             * @param callback
             */

        }, {
            key: 'trackPageView',
            value: function trackPageView(event, callback) {
                event = event || {};
                event.object_type = Metrics.Object.page;
                event.event_type = Metrics.Event.view;
                event.id = event.id || window.location.href;
                event.ch = event.ch || this.defaultChannel;

                // Queue the event for publishing
                this.trackEvent(event, callback);
            }

            /**
             * Adds an event to the queue
             * @param event
             * @param callback
             * @private
             */

        }, {
            key: '_push',
            value: function _push(event, callback) {
                this._queue.push({ event: event, callback: callback });

                // Save the queue
                this._saveQueue(true);

                // Start burning down the queue, unless the event says not to
                if (event._noProcess) {
                    delete event._noProcess;
                } else {
                    this._processQueue();
                }
            }

            /**
             * Burn down the queue
             * @private
             */

        }, {
            key: '_processQueue',
            value: function _processQueue() {
                var _this3 = this;

                // If the queue is not already being processed, and there's stuff to process, continue sending them
                if (!this._processTimeout && this._queue.length > 0) {
                    this._processTimeout = setTimeout(function () {

                        // Pull the items we're going to batch out of the queue
                        var items = _this3._queue.splice(0, 255);
                        _this3._saveQueue(false);

                        // Track the item
                        _this3._batchSend(items, function (err, res) {
                            // TODO: If there was an error, consider splicing the batch back into the queue

                            // Update / Set the metric sid on the publisher
                            /* istanbul ignore else: server barks */
                            if (res && res.data && res.data.sid) _this3._updateSid(res.data.sid);

                            // When this batch is done being tracked, iterate to the next metric then fire it's callback if set
                            _this3._processTimeout = null;
                            _this3._processQueue();

                            // Fire the event callbacks if there are any
                            items.forEach(function (item) {
                                item.callback && item.callback(err, res);
                            });
                        });
                    }, 0); // break event loop, maybe
                }
            }

            /**
             * Sends a bunch of queued metric events
             * @param items
             * @param callback
             * @private
             */

        }, {
            key: '_batchSend',
            value: function _batchSend(items, callback) {
                var _this4 = this;

                // Normalize event data
                var events = items.map(function (item) {
                    _this4._normalizeEvent(item.event);

                    // Strip duplicated data from event batch
                    delete item.event.sid;
                    delete item.event.win;

                    return item.event;
                });

                var payload = {
                    events: events,
                    win: window.location.href
                };

                var route = okanjo.net.getRoute(okanjo.net.routes.metrics_batch);

                // Set sid if present
                if (this.sid) {
                    payload.sid = this.sid;
                }

                // Send it
                okanjo.net.request.post(route, payload, function (err, res) {
                    /* istanbul ignore if: out of scope */
                    if (err) {
                        okanjo.report('Failed to send metrics batch', { err: err, res: res, items: items, route: route });
                    }
                    callback && callback(err, res);
                });
            }

            /**
             * Normaizes events so that they contain consistent data values
             * @param event
             * @private
             */

        }, {
            key: '_normalizeEvent',
            value: function _normalizeEvent(event) {

                // Ensure meta is ready to receive values
                event.m = event.m || {};

                // Set key
                event.key = event.key || event.m.key || okanjo.key || undefined;

                // Set session
                if (this.sid) event.sid = this.sid;

                // Clone the metadata, since it might be a direct reference to a widget property
                // Deleting properties on the meta object could be very destructive
                event.m = Object.assign({}, event.m); // event.m should be flat

                // Strip meta keys that should be excluded
                Object.keys(Metrics.Meta.exclude).forEach(function (key) {
                    return delete event.m[key];
                });

                // Set referral channel / context
                if (this.sourceCh) {
                    event.m.ref_ch = this.sourceCh;
                }
                if (this.sourceCx) {
                    event.m.ref_cx = this.sourceCx;
                }

                // Set page group id
                event.m.pgid = this.pageId;

                // Set okanjo version
                event.m.ok_ver = okanjo.version;

                // Finalize metadata
                event.m = okanjo.util.flatten(event.m, { arrayToCsv: true });

                // Ensure metadata strings won't exceed the imposed limit
                Object.keys(event.m).forEach(function (key) {
                    if (typeof event.m[key] === "string") {
                        event.m[key] = event.m[key].substr(0, 255);
                    }
                });

                // Set page source reference
                if (document.referrer) {
                    event.ref = document.referrer;
                }

                // Set the window location
                event.win = window.location.href;
            }

            /**
             * Updates the stored session identifier
             * @param sid
             * @private
             */

        }, {
            key: '_updateSid',
            value: function _updateSid(sid) {
                if (!this.sid && sid) {
                    this.sid = sid;
                    window.localStorage[Metrics.Params.name] = sid;
                    okanjo.util.cookie.set(Metrics.Params.name, sid, Metrics.Params.ttl);
                }
            }

            //noinspection JSUnusedGlobalSymbols
            /**
             * Adds DOM element dimensions / positional data to the event
             * @param element
             * @param event
             * @return {*|{}}
             */

        }, {
            key: 'create',


            //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
            /**
             * Helper to create a new fluent event structure
             * @param args
             * @return {*}
             */
            value: function create() {
                for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    args[_key3] = arguments[_key3];
                }

                return Metrics.create.apply(null, args);
            }
        }], [{
            key: 'addElementInfo',
            value: function addElementInfo(element, event) {
                var page = okanjo.ui.getPageSize(),
                    size = okanjo.ui.getElementPosition(element);

                event = event || {};
                event.m = event.m || {};
                event.m.pw = page.w;
                event.m.ph = page.h;
                event.m.x1 = size.x1;
                event.m.y1 = size.y1;
                event.m.x2 = size.x2;
                event.m.y2 = size.y2;

                return event;
            }

            //noinspection JSUnusedGlobalSymbols
            /**
             * Adds viewport dimensions / positional data to the event
             * @param event
             * @return {*|{}}
             */

        }, {
            key: 'addViewportInfo',
            value: function addViewportInfo(event) {
                var vp = okanjo.ui.getViewportSize(),
                    pos = okanjo.ui.getScrollPosition();

                event = event || {};
                event.m = event.m || {};
                event.m.vx1 = pos.x;
                event.m.vy1 = pos.y;
                event.m.vx2 = pos.x + vp.vw;
                event.m.vy2 = pos.y + vp.vh;

                return event;
            }

            //noinspection JSUnusedGlobalSymbols
            /**
             * Adds DOM event positional data to the event
             * @param jsEvent
             * @param event
             * @return {*|{}}
             */

        }, {
            key: 'addEventInfo',
            value: function addEventInfo(jsEvent, event) {
                var pos = okanjo.ui.getEventPosition(jsEvent);

                event = event || {};
                event.m = event.m || {};
                event.m.et = pos.et;
                event.m.ex = pos.ex;
                event.m.ey = pos.ey;

                return event;
            }

            //noinspection JSUnusedGlobalSymbols
            /**
             * Adds meta data values to the event
             * @param event
             * @param args
             * @return {*|{}}
             */

        }, {
            key: 'addEventMeta',
            value: function addEventMeta(event) {
                event = event || {};
                event.m = event.m || {};

                for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
                    args[_key4 - 1] = arguments[_key4];
                }

                event.m = Object.assign.apply(Object, [event.m].concat(args));

                return event;
            }

            /**
             * Helper to create a new fluent event structure
             * @param data
             * @param args
             * @return {MetricEvent}
             */

        }, {
            key: 'create',
            value: function create(data) {
                for (var _len5 = arguments.length, args = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
                    args[_key5 - 1] = arguments[_key5];
                }

                // return okanjo.util.deepClone(Object.assign.apply(Object, [{}].concat(args)));
                return new MetricEvent(data, args);
            }
        }]);

        return Metrics;
    }();

    /**
     * The storage/cookie/url param names
     * @type {{queue: string, name: string, channel: string, context: string, ttl: number}}
     */


    Metrics.Params = {
        queue: '_ok_q',
        name: 'ok_msid',
        channel: 'ok_ch',
        context: 'ok_cx',
        ttl: 1460 // 4 years
    };

    /**
     * Event Metadata configuration
     * @type {{exclude: [*]}}
     */
    Metrics.Meta = {
        exclude: ['key', 'callback', 'metrics_channel_context', 'metrics_context', 'mode']
    };

    /**
     * Event Types
     * @type {{view: string, impression: string, interaction: string, correlation: string}}
     */
    Metrics.Event = {
        view: 'vw',
        impression: 'imp',
        interaction: 'int',
        correlation: 'cor'
    };

    /**
     * Event Action Types
     * @type {{click: string, inline_click: string}}
     */
    Metrics.Action = {
        click: "click",
        inline_click: "inline_click"
    };

    /**
     * Event Object Types
     * @type {{article: string, thirdparty_ad: string, cart: string, page: string, widget: string, product: string, store: string, cause: string, marketplace: string, order: string, order_item: string, user: string, metric_session: string}}
     */
    Metrics.Object = {
        article: 'am',
        thirdparty_ad: 'ta',
        cart: 'ct',
        page: 'pg',
        widget: 'wg',
        product: 'pr',
        store: 'st',
        cause: 'ca',
        marketplace: 'mp',
        order: 'or',
        order_item: 'oi',
        user: 'ur',
        metric_session: 'mt'
    };

    /**
     * Event Channels
     * @type {{product_widget: string, ad_widget: string, store_widget: string, marketplace: string, external: string}}
     */
    Metrics.Channel = {
        placement: 'pw',
        marketplace: 'mp',
        external: 'ex',

        // Deprecated:
        product_widget: 'pw',
        ad_widget: 'aw',
        store_widget: 'sw'
    };

    /**
     * Event Environments
     * @type {{live: string, testing: string}}
     */
    Metrics.Environment = {
        live: "live",
        testing: "testing"
    };

    /**
     * Fluent wrapper around making events simple
     */

    var MetricEvent = function () {
        function MetricEvent(data, others) {
            var _this5 = this;

            _classCallCheck(this, MetricEvent);

            // Merge the data and other data sets into this object
            data = data || {};
            this.data(data);
            /* istanbul ignore else: metrics.create is the only way to create this right now */
            if (Array.isArray(others)) {
                others.forEach(function (data) {
                    _this5.data(data);
                });
            }
        }

        /**
         * Sets event parameter key-values
         * @param data
         */


        _createClass(MetricEvent, [{
            key: 'data',
            value: function data(_data) {
                Object.assign(this, okanjo.util.deepClone(_data));
                return this;
            }

            /**
             * Adds DOM event positional data to the event
             * @param jsEvent
             * @return {MetricEvent}
             */

        }, {
            key: 'event',
            value: function event(jsEvent) {
                Metrics.addEventInfo(jsEvent, this);
                return this;
            }

            /**
             * Adds viewport dimensions / positional data to the event
             * @return {MetricEvent}
             */

        }, {
            key: 'viewport',
            value: function viewport() {
                Metrics.addViewportInfo(this);
                return this;
            }

            /**
             * Adds DOM element dimensions / positional data to the event
             * @param element
             * @return {MetricEvent}
             */

        }, {
            key: 'element',
            value: function element(_element) {
                Metrics.addElementInfo(_element, this);
                return this;
            }

            //noinspection JSUnusedGlobalSymbols
            /**
             * Adds meta data values to the event
             * @param args
             * @return {MetricEvent}
             */

        }, {
            key: 'meta',
            value: function meta() {
                for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                    args[_key6] = arguments[_key6];
                }

                Metrics.addEventMeta.apply(null, [this].concat(args));
                return this;
            }

            /**
             * Sets the object and event type on the event w/o having to use .data
             * @param object_type
             * @param event_type
             * @return {MetricEvent}
             */

        }, {
            key: 'type',
            value: function type(object_type, event_type) {
                this.object_type = object_type;
                this.event_type = event_type;
                return this;
            }

            /**
             * Finalizes and sends the event
             * @param callback
             */

        }, {
            key: 'send',
            value: function send(callback) {
                okanjo.metrics.trackEvent(this, callback);
                // DONT RETURN - BREAK THE CHAIN HERE
            }

            /**
             * Gets the single-metric tracking url for this event
             * @return {string}
             */

        }, {
            key: 'toUrl',
            value: function toUrl() {
                // Copy data w/o modifying it
                var event = Object.assign({}, this);

                // Extract params
                var object_type = event.object_type,
                    event_type = event.event_type;

                delete event.object_type;
                delete event.event_type;

                // Normalize event data
                okanjo.metrics._normalizeEvent(event);

                // Get the URL
                return okanjo.net.getRoute(okanjo.net.routes.metrics, { object_type: object_type, event_type: event_type }) + '?' + okanjo.net.request.stringify(event);
            }
        }]);

        return MetricEvent;
    }();

    // Export / initialize


    okanjo.metrics = new Metrics();
})(window, document);
"use strict";

//noinspection ThisExpressionReferencesGlobalObjectJS
(function (window) {

    var okanjo = window.okanjo;

    // Track the page view, but don't send it right away.
    // Send it in one full second unless something else pushes an event
    // This way, we have a chance that a placement key will be set globally
    okanjo.metrics.trackPageView({ _noProcess: true });
    setTimeout(function () {
        okanjo.metrics._processQueue();
    }, 1000);
})(window);
"use strict";

//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
/** Based on https://gist.github.com/mudge/5830382 **/
(function (window) {

    /**
     * Simplified EventEmitter base class
     */
    var EventEmitter = function () {
        function EventEmitter() {
            _classCallCheck(this, EventEmitter);

            this._events = {};
        }

        /**
         * Registers an event handler to fire on any occurrence of an event
         * @param event
         * @param listener
         */


        _createClass(EventEmitter, [{
            key: 'on',
            value: function on(event, listener) {
                if (!this._events[event]) {
                    this._events[event] = [];
                }

                this._events[event].push(listener);
            }

            /**
             * Removes an event handler for an event
             * @param event
             * @param listener
             */

        }, {
            key: 'removeListener',
            value: function removeListener(event, listener) {

                if (this._events[event]) {
                    var idx = this._events[event].indexOf(listener);
                    if (idx >= 0) {
                        this._events[event].splice(idx, 1);
                    }
                }
            }

            /**
             * Emits an event
             * @param event
             */

        }, {
            key: 'emit',
            value: function emit(event) {
                var i = void 0,
                    listeners = void 0,
                    length = void 0,
                    args = [].slice.call(arguments, 1);

                if (this._events[event]) {
                    listeners = this._events[event].slice();
                    length = listeners.length;

                    for (i = 0; i < length; i++) {
                        listeners[i].apply(this, args);
                    }
                }
            }

            //noinspection JSUnusedGlobalSymbols
            /**
             * Registers an event handler to fire only once on an event
             * @param event
             * @param listener
             */

        }, {
            key: 'once',
            value: function once(event, listener) {
                var _arguments = arguments,
                    _this6 = this;

                var callback = function callback() {
                    var args = [].slice.call(_arguments, 1);
                    _this6.removeListener(event, callback);
                    listener.apply(_this6, args);
                };

                this.on(event, callback);
            }
        }]);

        return EventEmitter;
    }();

    window.okanjo._EventEmitter = EventEmitter;
    return EventEmitter;
})(window);
"use strict";

//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function (window) {

    var okanjo = window.okanjo;
    var DATA_ATTRIBUTE_PATTERN = /^data-(.+)$/;
    var DATA_REPLACE_PATTERN = /-/g;

    /**
     * Base widget class
     */

    var Widget = function (_okanjo$_EventEmitter) {
        _inherits(Widget, _okanjo$_EventEmitter);

        function Widget(element, options) {
            _classCallCheck(this, Widget);

            // Verify element was given (we can't load unless we have one)
            var _this7 = _possibleConstructorReturn(this, (Widget.__proto__ || Object.getPrototypeOf(Widget)).call(this));

            if (!element || element === null || element.nodeType === undefined) {
                okanjo.report('Invalid or missing element on widget construction', { widget: _this7, element: element, options: options });
                throw new Error('Okanjo: Invalid element - make sure to pass a valid DOM element when constructing Okanjo Widgets.');
            }

            // Verify configuration is OK
            if (options && (typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== "object") {
                // Warn and fix it
                okanjo.report('Invalid widget options. Expected object, got: ' + (typeof options === 'undefined' ? 'undefined' : _typeof(options)), { widget: _this7, element: element, options: options });
                options = {};
            } else {
                options = options || {};
            }

            // Store basics
            _this7.name = 'Widget';
            _this7.element = element;
            _this7.instanceId = okanjo.util.shortid();

            // Clone initial config, breaking the top-level reference
            _this7.config = Object.assign({}, options);
            return _this7;
        }

        /**
         * Base widget initialization procedures
         */


        _createClass(Widget, [{
            key: 'init',
            value: function init() {
                // process config attributes
                this._applyConfiguration();

                this._setCompatibilityOptions();

                // ensure placement key
                if (!this._ensurePlacementKey()) return;

                // Tell the widget to load
                this.load();
            }

            /**
             * This is for extended widgets, so they may modify the configuration before loading
             */

        }, {
            key: '_setCompatibilityOptions',
            value: function _setCompatibilityOptions() {}
            // By default, this does nothing. Must be overridden to be useful


            //noinspection JSMethodCanBeStatic
            /**
             * Widget configuration definitions
             * @return {{}}
             */

        }, {
            key: 'getSettings',
            value: function getSettings() {
                // Override this
                return {};
            }

            /**
             * Main widget load function.
             */

        }, {
            key: 'load',
            value: function load() {}
            // Override this in the widget implementation


            /**
             * Applies data attribute settings and defaults to the widget configuration
             * @private
             */

        }, {
            key: '_applyConfiguration',
            value: function _applyConfiguration() {
                var _this8 = this;

                // this.config was set to the options provided in the constructor
                // so layer data attributes on top

                var data = this.getDataAttributes();
                var settings = this.getSettings();
                Object.keys(data).forEach(function (key) {
                    var normalizedKey = key.replace(DATA_REPLACE_PATTERN, '_');

                    var val = data[key];

                    // Attempt to convert the value if there's a setting for it
                    if (settings[normalizedKey]) val = settings[normalizedKey].value(val, false);

                    if (!okanjo.util.isEmpty(val)) {
                        _this8.config[normalizedKey] = val;
                    }
                });

                // Apply defaults from the widget settings
                Object.keys(settings).forEach(function (key) {
                    if (_this8.config[key] === undefined && settings[key]._default !== undefined) {
                        _this8.config[key] = settings[key].value(undefined, false);
                    }
                });
            }

            //noinspection JSUnusedGlobalSymbols
            /**
             * Gets a copy of the configuration, suitable for transmission
             * @return {{}}
             */

        }, {
            key: 'getConfig',
            value: function getConfig() {
                var _this9 = this;

                var settings = this.getSettings();
                var out = {};

                Object.keys(this.config).forEach(function (origKey) {
                    var val = _this9.config[origKey];
                    var key = origKey;
                    var group = null;

                    // Check if this is a known property
                    if (settings[key]) {
                        val = settings[key].value(val);
                        group = settings[key].getGroup();
                    }

                    // Init the target/group if not already setup
                    var target = out;
                    if (group) {
                        target[group] = target[group] || {};
                        target = target[group];
                    }

                    // Set the value on the target if set
                    if (val === null) {
                        target[key] = ''; // format null values as empty strings for transmission
                    } else if (val !== undefined) {
                        target[key] = val;
                    }
                });

                return out;
            }

            /**
             * Before loading, ensure that a placement key is present or abort
             * @return {boolean}
             * @private
             */

        }, {
            key: '_ensurePlacementKey',
            value: function _ensurePlacementKey() {

                // Check if set on widget or globally
                if (this.config.key) {
                    return true;
                } else if (okanjo.key) {
                    // Copy key from global scope,
                    this.config.key = okanjo.key;
                    return true;
                }

                // No key set, can't load.
                okanjo.report('No key provided on widget', { widget: this });
                this.showError('Error: Missing placement key.');
                return false;
            }

            /**
             * Displays an error in the widget element
             * @param message
             */

        }, {
            key: 'showError',
            value: function showError(message) {
                this.setMarkup(okanjo.ui.engine.render('okanjo.error', this, { message: message }));
            }

            /**
             * Sets the markup of the widget's element
             * @param markup
             */

        }, {
            key: 'setMarkup',
            value: function setMarkup(markup) {
                this.element.innerHTML = markup;
            }

            //noinspection JSUnusedGlobalSymbols
            /**
             * Gets the current page URL, sans query string and fragment.
             * @returns {string} - URL
             */

        }, {
            key: 'getDataAttributes',


            /**
             * Instead of using HTML5 dataset, just rip through attributes and return data attributes
             * @returns {*}
             */
            value: function getDataAttributes() {
                var data = {};
                Array.from(this.element.attributes).forEach(function (attr) {
                    var match = DATA_ATTRIBUTE_PATTERN.exec(attr.name);
                    if (match) {
                        data[match[1]] = attr.value;
                    }
                });
                return data;
            }
        }], [{
            key: 'getCurrentPageUrl',
            value: function getCurrentPageUrl() {
                return window.location.href.replace(/([?#].*)$/, '');
            }
        }]);

        return Widget;
    }(okanjo._EventEmitter);

    /**
     * Fluent configuration helper for organizing and formatting ad-hoc configuration values
     * @type {Field}
     */


    Widget.Field = function () {

        //noinspection JSUnusedGlobalSymbols
        function Field() {
            _classCallCheck(this, Field);

            this._convert = null;
            this._strip = false;
            this._default = undefined;
            this._group = null;
        }

        /**
         * Formats the value as an array of strings
         * @param converter
         * @return {Field}
         */


        _createClass(Field, [{
            key: 'array',
            value: function array(converter) {
                this._convert = function (val) {
                    if (Array.isArray(val)) {
                        if (converter) {
                            return val.map(function (v) {
                                return converter(v);
                            });
                        } else {
                            return val;
                        }
                    }
                    val = val.replace(/\\,/g, '\0');
                    return val.split(',').map(function (v) {
                        var res = v.trim().replace('\0', ',');
                        if (converter) res = converter(res);
                        return res;
                    });
                };
                return this;
            }
            //noinspection JSUnusedGlobalSymbols

        }, {
            key: 'string',


            /**
             * Formats the value as a string
             * @return {Field}
             */
            value: function string() {
                this._convert = function (val) {
                    if (val === null || val === undefined) return val;else return "" + val;
                };
                return this;
            }
        }, {
            key: 'bool',


            /**
             * Formats the value as a boolean (takes 1, 0, true, false)
             * @return {Field}
             */
            value: function bool() {
                this._convert = function (val) {
                    if (typeof val === "string") {
                        return val === "1" || val.toLowerCase() === "true";
                    } else {
                        return !!val;
                    }
                };
                return this;
            }
            //noinspection JSUnusedGlobalSymbols

        }, {
            key: 'strip',


            /**
             * Indicates the field should not be passed on for transmission
             * @return {Field}
             */
            value: function strip() {
                this._strip = true;return this;
            }
        }, {
            key: 'int',


            /**
             * Formats the value as a integer (whole) number
             * @return {Field}
             */
            value: function int() {
                this._convert = function (val) {
                    return parseInt(val);
                };return this;
            }
            //noinspection JSUnusedGlobalSymbols

        }, {
            key: 'float',


            /**
             * Formats the value as a floating point number
             * @return {Field}
             */
            value: function float() {
                this._convert = function (val) {
                    return parseFloat(val);
                };return this;
            }
            //noinspection JSUnusedGlobalSymbols

        }, {
            key: 'default',


            //noinspection ReservedWordAsName
            /**
             * Sets the default value to use if not set
             * @param val
             * @return {Field}
             */
            value: function _default(val) {
                this._default = val;
                return this;
            }

            /**
             * Assigns the property to a bucket for hierarchy
             * @param name
             * @return {Field}
             */

        }, {
            key: 'group',
            value: function group(name) {
                this._group = name;
                return this;
            }

            /**
             * Gets the group the field belongs to
             * @return {*|null}
             */

        }, {
            key: 'getGroup',
            value: function getGroup() {
                return this._group;
            }

            //noinspection JSUnusedGlobalSymbols
            /**
             * Gets the formatted value of the field
             * @param val
             * @param strip
             * @return {*}
             */

        }, {
            key: 'value',
            value: function value(val) {
                var strip = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

                if (this._strip && strip) return undefined;
                if (val !== undefined && this._convert) {
                    val = this._convert(val);
                }
                return val !== undefined ? val : this._default;
            }
        }], [{
            key: 'array',
            value: function array(converter) {
                return new Field().array(converter);
            }
        }, {
            key: 'string',
            value: function string() {
                return new Field().string();
            }
        }, {
            key: 'bool',
            value: function bool() {
                return new Field().bool();
            }
        }, {
            key: 'strip',
            value: function strip() {
                return new Field().strip();
            }
        }, {
            key: 'int',
            value: function int() {
                return new Field().int();
            }
        }, {
            key: 'float',
            value: function float() {
                return new Field().float();
            }
        }]);

        return Field;
    }();

    // Export
    return okanjo._Widget = Widget;
})(window);

"use strict";

//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function (window) {

    //region Imports and Constants

    var okanjo = window.okanjo;
    var _okanjo$_Widget$Field = okanjo._Widget.Field,
        string = _okanjo$_Widget$Field.string,
        array = _okanjo$_Widget$Field.array,
        float = _okanjo$_Widget$Field.float,
        int = _okanjo$_Widget$Field.int,
        bool = _okanjo$_Widget$Field.bool;

    var Metrics = okanjo.metrics.constructor;
    var TemplateEngine = okanjo.ui.engine.constructor;

    var FILTERS = 'filters';
    var DISPLAY = 'display';
    var ARTICLE_META = 'article_meta';

    var MINIMUM_VIEW_PX = 0.5; // 50% of pixels must be in viewport
    var MINIMUM_VIEW_TIME = 1000; // for 1 full second
    var MINIMUM_VIEW_FREQ = 2; // time / freq = interval

    //endregion

    /**
     * Placement widget
     */

    var Placement = function (_okanjo$_Widget) {
        _inherits(Placement, _okanjo$_Widget);

        //region Configuration & Overrides

        /**
         * Initializes a new placement
         * @param element
         * @param options
         */
        function Placement(element) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            _classCallCheck(this, Placement);

            // Flatten the options before passing on
            options = okanjo.util.flatten(options, { ignoreArrays: true });

            var _this10 = _possibleConstructorReturn(this, (Placement.__proto__ || Object.getPrototypeOf(Placement)).call(this, element, options));

            _this10.name = 'Placement';
            _this10._metricBase = {}; // placeholder for metrics
            _this10._response = null;

            // Aggregate view watchers into a single interval fn
            _this10._viewWatcherIv = null;
            _this10._viewedWatchers = [];

            // Start loading content
            if (!options.no_init) _this10.init();
            return _this10;
        }

        //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
        /**
         * Gets the widget settings configuration
         * @return {{type: *, ids: *, q: *, url: *, url_referrer: *, url_selectors: *, organization_id: *, property_id: *, store_id: *, organization_name: *, property_name: *, store_name: *, external_id: *, sku: *, external_store_id: *, condition: *, manufacturer: *, upc: *, isbn: *, tags: *, category: *, pools: *, min_price: *, max_price: *, min_donation_percent: *, max_donation_percent: *, donation_to: *, sort_by: *, sort_direction: *, skip: *, take: *, placement_tests_only: *, size: *, template_name: *, template_layout: *, template_theme: *, template_cta_style: *, template_cta_text: *, template_cta_color: *, adx_unit_path: *, url_category: *, url_keywords: *, no_init: *, proxy_url: *, expandable, disable_inline_buy, disable_popup, backwards: *}}
         */


        _createClass(Placement, [{
            key: 'getSettings',
            value: function getSettings() {
                return {

                    // What type of response do you want
                    type: string().group(FILTERS),

                    // What specific products do you want
                    ids: array().group(FILTERS),

                    // Filter by generic query string
                    q: string().group(FILTERS),

                    // Filter by relation to content
                    url: string().group(FILTERS),
                    url_referrer: string().group(FILTERS).strip(),
                    url_selectors: string().group(FILTERS),

                    // Filter by hierarchy
                    organization_id: string().group(FILTERS),
                    property_id: string().group(FILTERS),
                    store_id: string().group(FILTERS),

                    // Filter by hierarchy names (use *_id where possible, this might not work as you might expect)
                    organization_name: string().group(FILTERS),
                    property_name: string().group(FILTERS),
                    store_name: string().group(FILTERS),

                    // Filter by integrations
                    external_id: string().group(FILTERS),
                    sku: string().group(FILTERS),
                    external_store_id: string().group(FILTERS),

                    // Filter by product attributes
                    condition: string().group(FILTERS),
                    manufacturer: string().group(FILTERS),
                    upc: string().group(FILTERS),
                    isbn: string().group(FILTERS),

                    // Filter by categorization / distribution
                    tags: array().group(FILTERS),
                    category: array().group(FILTERS),
                    pools: array().group(FILTERS),

                    // Filter by price range
                    min_price: float().group(FILTERS),
                    max_price: float().group(FILTERS),

                    // Filter by donation ranges
                    min_donation_percent: float().group(FILTERS),
                    max_donation_percent: float().group(FILTERS),

                    // Filter by donation recipient
                    donation_to: string().group(FILTERS),

                    // Sorting
                    sort_by: string().group(FILTERS),
                    sort_direction: string().group(FILTERS),

                    // Pagination
                    skip: int().group(FILTERS),
                    take: int().group(FILTERS),

                    // Placement Testing
                    placement_tests_only: bool(),

                    // Display settings
                    size: string().group(DISPLAY),
                    template_name: string().group(DISPLAY),
                    template_layout: string().group(DISPLAY),
                    template_theme: string().group(DISPLAY),
                    template_cta_style: string().group(DISPLAY),
                    template_cta_text: string().group(DISPLAY),
                    template_cta_color: string().group(DISPLAY),
                    adx_unit_path: string().group(DISPLAY), // Custom DFP ad unit path

                    // Article metadata
                    url_category: array().group(ARTICLE_META),
                    url_keywords: array().group(ARTICLE_META),

                    // Functional settings
                    key: string().strip(), // don't need to resend key on all our requests
                    no_init: bool().strip(), // don't automatically load the placement, do it manually (e.g. (new Placement({no_init:true})).init()
                    proxy_url: string().strip(),
                    expandable: bool().strip().default(true),
                    disable_inline_buy: bool().strip().default(false), // stops inline buy functionality
                    disable_popup: bool().strip().default(false), // stops new window on mobile for inline buy functionality
                    backwards: string().strip() // internal flag indicating port from a deprecated widget
                };
            }

            /**
             * Gets the widget configuration formatted using settings, suitable for transmission
             * @return {{filters: {}, display: {}, backfill: {}, article_meta: {}}}
             */

        }, {
            key: 'getConfig',
            value: function getConfig() {
                var _this11 = this;

                var settings = this.getSettings();
                var out = { filters: {}, display: {}, backfill: {}, article_meta: {} };
                var backfillPattern = /^backfill_(.+)$/; // backfill_property

                Object.keys(this.config).forEach(function (origKey) {
                    var val = _this11.config[origKey];
                    var key = origKey;
                    var isBackfill = false;
                    var group = null;

                    // Get the property name if it was prefixed with backfill
                    var matches = backfillPattern.exec(origKey);
                    if (matches) {
                        key = matches[1];
                        isBackfill = true;
                    }

                    // Check if this is a known property
                    if (settings[key]) {
                        val = settings[key].value(val);
                        group = settings[key].getGroup();
                    }

                    // Init the target/group if not already setup
                    var target = isBackfill ? out.backfill : out;
                    if (group) {
                        target[group] = target[group] || {};
                        target = target[group];
                    }

                    // Set the value on the target if set
                    if (val === null) {
                        target[key] = ''; // format null values as empty strings for transmission
                    } else if (val !== undefined) {
                        target[key] = val;
                    }
                });

                return out;
            }

            //noinspection JSUnusedGlobalSymbols
            /**
             * Core load process
             */

        }, {
            key: 'load',
            value: function load() {
                var _this12 = this;

                // Set metric base data (stub for all future events emitted by the widget)
                this._setMetricBase();

                // Find out what we should display here
                this._fetchContent(function (err) {
                    if (err) {
                        // Report the widget load as declined
                        _this12._reportWidgetLoad("fetch failed: " + err.statusCode /* istanbul ignore next: out of scope */ || err.toString());
                    } else {
                        // Merge display settings from response
                        _this12._mergeResponseSettings();

                        // Merge the referential data from the response
                        _this12._updateBaseMetaFromResponse();

                        // Handle rendering based on output type
                        _this12._showContent();
                    }
                });
            }

            //endregion

            //region Internal Helpers

            /**
             * Initializes the common metric data for events emitted by the placement
             * @private
             */

        }, {
            key: '_setMetricBase',
            value: function _setMetricBase() {
                var base = this._metricBase;
                base.ch = Metrics.Channel.placement;
                base.cx = this.config.backwards || 'auto';
                base.key = this.config.key;
                base.m = base.m || {};
                base.m.wgid = this.instanceId;
            }

            /**
             * Emits the widget impression event
             * @param declined
             * @private
             */

        }, {
            key: '_reportWidgetLoad',
            value: function _reportWidgetLoad(declined) {
                var _this13 = this;

                var res = this._response || {};
                var data = res.data || { results: [] };

                // If this is declined, mark future events as declined too
                this._metricBase.m.decl = declined || '0';

                // Attach other main response attributes to all future events
                this._metricBase.m.res_bf = data.backfilled ? 1 : 0; // whether the response used the backup fill flow
                this._metricBase.m.res_total = data.total || 0; // how many total candidate results were available given filters
                this._metricBase.m.res_type = data.type; // what the given resource type was
                this._metricBase.m.res_length = data.results.length; // what the given resource type was

                // Track impression
                okanjo.metrics.create(this._metricBase).type(Metrics.Object.widget, Metrics.Event.impression).meta(this.getConfig()).element(this.element) // this might not be all that useful cuz the content hasn't been rendered yet
                .viewport().send();

                // Start watching for a viewable impression
                this._addOnceViewedHandler(this.element, function () {
                    okanjo.metrics.create(_this13._metricBase).type(Metrics.Object.widget, Metrics.Event.view).meta(_this13.getConfig()).element(_this13.element).viewport().send();
                });
            }

            /**
             * Executes the request for content to fill the placement
             * @param callback
             * @private
             */

        }, {
            key: '_fetchContent',
            value: function _fetchContent(callback) {
                var _this14 = this;

                // Build request to api, starting with this placement config params
                var query = this.getConfig();

                // Extract the key
                var key = this.config.key;

                // Attach sid and referrer
                if (okanjo.metrics.sid) query.sid = okanjo.metrics.sid;
                query.filters.url_referrer = this.config.url_referrer || window.location.href;
                query.wgid = this.instanceId;
                query.pgid = okanjo.metrics.pageId;

                // Send it
                okanjo.net.request.post(okanjo.net.getRoute(okanjo.net.routes.ads, null, this.config.sandbox ? 'sandbox' : 'live') + '?key=' + encodeURIComponent(key), query, function (err, res) {
                    if (err) {
                        okanjo.report('Failed to retrieve placement content', err, { placement: _this14 });
                        _this14.setMarkup(''); // Don't show anything
                        _this14.emit('error', err);
                        callback && callback(err);
                    } else {

                        // Store the raw response
                        _this14._response = res;

                        // Hook point for response handling
                        _this14.emit('data');

                        // Return
                        callback && callback();
                    }
                });
            }

            /**
             * Applies response filters and display settings into the widget configuration
             * @private
             */

        }, {
            key: '_mergeResponseSettings',
            value: function _mergeResponseSettings() {
                var _this15 = this;

                var res = this._response;
                var data = res.data || {};
                var settings = data.settings || {};

                if (settings.filters) {
                    Object.keys(settings.filters).forEach(function (key) {
                        _this15.config[key] = settings.filters[key];
                    });
                }

                if (settings.display) {
                    Object.keys(settings.display).forEach(function (key) {
                        _this15.config[key] = settings.display[key];
                    });
                }
            }

            /**
             * Applies response data to future metric events
             * @private
             */

        }, {
            key: '_updateBaseMetaFromResponse',
            value: function _updateBaseMetaFromResponse() {
                // Update the base metric data with info from the response
                var data = (this._response || {}).data || {};
                this._metricBase.m = this._metricBase.m || {};
                var meta = this._metricBase.m;

                // Article
                if (data.article) meta.aid = data.article.id;

                if (data.test && data.test.enabled) {
                    meta.pten = 1;
                    meta.ptid = data.test.id;
                    meta.ptseed = data.test.seed;
                } else {
                    meta.pten = 0;
                }
            }

            /**
             * Beings the render process based on the response content
             * @private
             */

        }, {
            key: '_showContent',
            value: function _showContent() {
                var data = (this._response || {}).data || {};

                // Known content types we can display
                if (data.type === Placement.ContentTypes.products) {
                    this._showProducts();
                } else if (data.type === Placement.ContentTypes.articles) {
                    this._showArticles();
                } else if (data.type === Placement.ContentTypes.adx) {
                    this._showADX();
                } else {
                    // Unknown response type!

                    // Report the widget load as declined
                    var msg = 'Unknown response content type: ' + data.type;
                    okanjo.report(msg, { placement: this });
                    this.setMarkup(''); // Don't show anything
                    this.emit('error', msg);
                    this._reportWidgetLoad(msg);
                }
            }

            /**
             * Generates the click url using the event, proxy_url, and additional params
             * @param event
             * @param url
             * @param additionalUrlParams
             * @return {*}
             * @private
             */

        }, {
            key: '_getClickThroughURL',
            value: function _getClickThroughURL(event, url, additionalUrlParams) {
                var joiner = url.indexOf('?') >= 0 ? '&' : '?';

                // Tack on transfer params
                additionalUrlParams = additionalUrlParams /* istanbul ignore next: paranoia */ || {};
                additionalUrlParams.ok_msid = okanjo.metrics.sid || 'unknown';
                additionalUrlParams.ok_ch = this._metricBase.ch;
                additionalUrlParams.ok_cx = this._metricBase.cx;
                additionalUrlParams.utm_source = 'okanjo';
                additionalUrlParams.utm_campaign = 'smartserve';

                url += joiner + Object.keys(additionalUrlParams).map(function (key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(additionalUrlParams[key]);
                }).join('&');

                // Wrap the url if we're proxying
                if (this.config.proxy_url) {
                    url = this.config.proxy_url + encodeURIComponent(url);
                }

                // Set the url on the event
                event.data({
                    u: url
                });

                return event.toUrl();
            }

            /**
             * Converts a resource's link into one suitable for tracking, making middle-click safe
             * @param type
             * @param resource
             * @param e
             * @private
             */

        }, {
            key: '_handleResourceMouseDown',
            value: function _handleResourceMouseDown(type, resource, e) {
                // Generate a new click id for this event
                var clickId = okanjo.util.shortid();

                // Start building the event
                var event = okanjo.metrics.create(this._metricBase, {
                    id: resource.id
                }).type(type, Metrics.Event.interaction).meta(this.getConfig()).meta({ cid: clickId }).meta({ bf: resource.backfill ? 1 : 0 }).event(e).element(e.currentTarget).viewport();

                // Pull the proper params out of the resource depending on it's type
                var trackParam = 'url_track_param';
                var urlParam = 'url';

                if (type === Metrics.Object.product) {
                    trackParam = 'buy_url_track_param';
                    urlParam = 'buy_url';
                }

                // Attach the campaign tracking identifier
                var additionalParams = {
                    ok_cid: clickId
                };
                if (resource[trackParam]) additionalParams[resource[trackParam]] = (okanjo.metrics.sid || 'unknown') + ':' + clickId;

                // Update the link with the event data
                event.data({ ea: Metrics.Action.click });
                e.currentTarget.href = this._getClickThroughURL(event, resource[urlParam], additionalParams);

                // Cache this on the product
                resource._clickId = clickId;
                resource._event = event;
                resource._additionalParams = additionalParams;
            }

            /**
             * Gets the template to use, accounting for configured preference if available
             * @param contentType
             * @param defaultName
             * @return {string}
             * @private
             */

        }, {
            key: '_getTemplate',
            value: function _getTemplate(contentType, defaultName) {
                var templateName = this.config.template_name;
                if (!templateName || !okanjo.ui.engine.isTemplateRegistered(contentType + '.' + templateName)) {
                    templateName = defaultName;
                }
                return contentType + '.' + templateName;
            }

            /**
             * Enforces size/layout/cta restrictions
             * @private
             */

        }, {
            key: '_enforceLayoutOptions',
            value: function _enforceLayoutOptions() {
                // Enforce format restrictions
                if (this.config.size === "leaderboard" || this.config.size === "large_mobile_banner") {
                    this.config.template_layout = "list";
                    this.config.template_cta_style = "link";
                } else if (this.config.size === "half_page" || this.config.size === "auto") {
                    this.config.template_layout = "list";
                }
            }

            /**
             * Register a custom
             * @private
             */

        }, {
            key: '_registerCustomBranding',
            value: function _registerCustomBranding(prefix, buttonClass) {
                var brandColor = this.config.template_cta_color;
                if (brandColor) {
                    var brandCSS = void 0,
                        brandCSSId = "okanjo-wgid-" + this.instanceId;

                    brandCSS = '\n                    ' + prefix + '-block2.' + brandCSSId + ' ' + prefix + '-' + buttonClass + ' { color: ' + brandColor + ';} \n                    ' + prefix + '-block2.' + brandCSSId + '.okanjo-cta-style-button ' + prefix + '-' + buttonClass + ' { border: 1px solid ' + brandColor + '; } \n                    ' + prefix + '-block2.' + brandCSSId + '.okanjo-cta-style-button ' + prefix + '-' + buttonClass + ':hover { background: ' + brandColor + '; } \n                ';

                    okanjo.ui.engine.registerCss(brandCSSId, brandCSS, { id: brandCSSId });
                    okanjo.ui.engine.ensureCss(brandCSSId);
                }
            }

            /**
             * When element is in view per viewability constants (50% for 1s) trigger handler once
             * @param element
             * @param handler
             * @private
             */

        }, {
            key: '_addOnceViewedHandler',
            value: function _addOnceViewedHandler(element, handler) {
                var controller = {
                    element: element,
                    successfulCount: 0,
                    handler: handler
                };

                // Add our element to the watch list and turn on the watcher if not already on
                this._viewedWatchers.push(controller);
                this._toggleViewWatcher(true);
            }

            /**
             * Interval function to check viewability of registered elements
             * @private
             */

        }, {
            key: '_checkViewWatchers',
            value: function _checkViewWatchers() {

                // Check each registered watcher
                for (var i = 0, controller; i < this._viewedWatchers.length; i++) {
                    controller = this._viewedWatchers[i];

                    // Check if watcher is complete, then remove it from the list
                    /* istanbul ignore if: jsdom won't trigger this */
                    if (okanjo.ui.getPercentageInViewport(controller.element) >= MINIMUM_VIEW_PX) {
                        controller.successfulCount++;
                    }

                    // While this could more optimally be contained within the former condition, unit-testing blocks on this
                    if (controller.successfulCount >= MINIMUM_VIEW_FREQ) {
                        controller.handler();
                        this._viewedWatchers.splice(i, 1);
                        i--;
                    }
                }

                // Turn off if nobody is watching
                if (this._viewedWatchers.length === 0) {
                    this._toggleViewWatcher(false);
                }
            }

            /**
             * Turns the viewability watcher on and off
             * @param enabled
             * @private
             */

        }, {
            key: '_toggleViewWatcher',
            value: function _toggleViewWatcher(enabled) {
                if (enabled) {
                    if (this._viewWatcherIv === null) {
                        this._viewWatcherIv = setInterval(this._checkViewWatchers.bind(this), MINIMUM_VIEW_TIME / MINIMUM_VIEW_FREQ);
                    }
                } else {
                    clearInterval(this._viewWatcherIv);
                    this._viewWatcherIv = null;
                }
            }

            //endregion

            //region Product Handling

            /**
             * Renders a product response
             * @private
             */

        }, {
            key: '_showProducts',
            value: function _showProducts() {
                var _this16 = this;

                var data = (this._response || { data: { results: [] } }).data || { results: [] };

                // Determine template to render, using custom template name if it exists
                var templateName = this._getTemplate(Placement.ContentTypes.products, Placement.DefaultTemplates.products);

                // - render

                // Format products
                data.results.forEach(function (offer, index) {
                    // Disable inline buy if configured to do so
                    if (_this16.config.disable_inline_buy) offer.inline_buy_url = null;
                    if (offer.inline_buy_url) offer._escaped_inline_buy_url = encodeURIComponent(offer.inline_buy_url);

                    // Set primary image
                    offer._image_url = offer.image_urls ? offer.image_urls[0] : '';

                    // Escape buy url (fixme: does not include proxy_url!)
                    offer._escaped_buy_url = encodeURIComponent(offer.buy_url);

                    // Make price tag pretty
                    offer._price_formatted = TemplateEngine.formatCurrency(offer.price);
                    offer._index = index;
                });

                // Render and display the results
                this.setMarkup(okanjo.ui.engine.render(templateName, this));

                // Track widget impression
                if (data.results.length === 0) {
                    // Hook point for no results found
                    this.emit('empty');
                    this._reportWidgetLoad('empty'); // decline the impression
                } else {
                    this._reportWidgetLoad();
                }

                // Bind interaction handlers and track impressions
                this.element.querySelectorAll('a').forEach(function (a) {

                    var id = a.getAttribute('data-id'),
                        index = a.getAttribute('data-index');

                    // Don't bind links that are not tile links
                    /* istanbul ignore else: custom templates could break it */
                    if (id && index >= 0) {
                        var product = _this16._response.data.results[index];
                        /* istanbul ignore else: custom templates could break it */
                        if (product) {

                            // Bind interaction listener
                            a.addEventListener('mousedown', _this16._handleResourceMouseDown.bind(_this16, Metrics.Object.product, product));
                            a.addEventListener('click', _this16._handleProductClick.bind(_this16, product));

                            // Track impression
                            okanjo.metrics.create(_this16._metricBase, { id: product.id }).type(Metrics.Object.product, Metrics.Event.impression).meta(_this16.getConfig()).meta({ bf: product.backfill ? 1 : 0 }).element(a).viewport().send();

                            // Start watching for a viewable impression
                            _this16._addOnceViewedHandler(a, function () {
                                okanjo.metrics.create(_this16._metricBase, { id: product.id }).type(Metrics.Object.product, Metrics.Event.view).meta(_this16.getConfig()).meta({ bf: product.backfill ? 1 : 0 }).element(a).viewport().send();
                            });
                        }
                    }
                });

                // Truncate product name to fit the space
                this.element.querySelectorAll('.okanjo-resource-title').forEach(function (element) {
                    okanjo.ui.ellipsify(element);
                });

                // Hook point that the widget is done loading
                this.emit('load');
            }

            /**
             * Handles the product click process
             * @param product
             * @param e
             * @private
             */

        }, {
            key: '_handleProductClick',
            value: function _handleProductClick(product, e) {

                // Update the event
                if (!product._event || !product._additionalParams || !product._clickId) {
                    this._handleResourceMouseDown(Metrics.Object.product, product, e);
                }

                // Extract the already generated event and params list
                var event = product._event,
                    additionalParams = product._additionalParams;

                // Update the event to the current one

                event.event(e);

                // Determine what we're doing - native ux or redirect
                var showNativeBuyUx = !!product.inline_buy_url,
                    showPopupNativeBuyUx = !this.config.disable_popup && showNativeBuyUx && okanjo.util.isMobile();

                // Show the inline buy experience or redirect
                if (showPopupNativeBuyUx) {
                    // Mobile native buy ux

                    // Don't follow the link
                    e.preventDefault();

                    //
                    // Mobile devices (especially iOS) have real janky UX when interacting with iframes.
                    // So, we'll choose to popup a window with the native buy experience, so we can ensure
                    // a positive user experience. Nobody likes bouncy form fields and really weird zooming.
                    //

                    // Update the event
                    event.data({ ea: Metrics.Action.inline_click }).meta({ popup: 'true' });

                    // Get the frame url
                    var url = this._getClickThroughURL(event, product.inline_buy_url, additionalParams);

                    // Open the window or redirect if that failed
                    this._popupFrame = window.open(url, "okanjo-inline-buy-frame", "width=400,height=400,location=yes,resizable=yes,scrollbars=yes");
                    /* istanbul ignore else: jsdom doesn't support window.open or setting window.location.href */
                    if (!this._popupFrame) {
                        // Fallback to just replacing the window with the target, since popups don't work :(
                        okanjo.report('Popup blocker stopped buy experience from showing', { placement: this });
                        window.location.href = url;
                    }
                } else if (showNativeBuyUx) {
                    // Regular native buy ux

                    // Don't follow the link
                    e.preventDefault();

                    var frame = document.createElement('iframe');
                    var attributes = {
                        'class': 'okanjo-inline-buy-frame',
                        frameborder: 0,
                        vspace: 0,
                        hspace: 0,
                        webkitallowfullscreen: '',
                        mozallowfullscreen: '',
                        allowfullscreen: '',
                        scrolling: 'auto'
                    };

                    // Apply attributes
                    Object.keys(attributes).forEach(function (key) {
                        return frame.setAttribute(key, attributes[key]);
                    });

                    // Check whether we're allowed to expand past the bounds of the placement
                    additionalParams.expandable = this.config.expandable ? 1 : 0;
                    if (!this.config.expandable) {
                        var parent = this.element.querySelector('.okanjo-expansion-root');
                        /* istanbul ignore else: custom templates could break this */
                        if (parent) {
                            frame.className += ' okanjo-ad-in-unit';
                            frame.setAttribute('height', "100%");
                            frame.setAttribute('width', "100%");

                            parent.appendChild(frame);

                            var size = okanjo.ui.getElementSize(parent);
                            additionalParams.frame_height = size.height;
                            additionalParams.frame_width = size.width;
                            /* istanbul ignore next: i'm not writing a whole test for this one config param */
                            if (this.config.size) additionalParams.ad_size = this.config.size;
                        }
                    }

                    // Update the event
                    event.data({ ea: Metrics.Action.inline_click }).meta({ expandable: this.config.expandable ? 'true' : 'false' });

                    // Set the frame url
                    frame.src = this._getClickThroughURL(event, product.inline_buy_url, additionalParams);

                    // Show the modal if it was not internally expanded
                    if (!frame.parentNode) {
                        okanjo.ui.modal.show(frame);
                    }
                } else {
                    // Update the link a second time, just in case the data changed
                    e.currentTarget.href = this._getClickThroughURL(event, product.buy_url, additionalParams);
                }
            }

            //endregion

            //region Article Handling

            /**
             * Renders an article response
             * @private
             */

        }, {
            key: '_showArticles',
            value: function _showArticles() {
                var _this17 = this;

                var data = (this._response || { data: { results: [] } }).data || { results: [] };

                // Determine template to render, using custom template name if it exists
                var templateName = this._getTemplate(Placement.ContentTypes.articles, Placement.DefaultTemplates.articles);

                // - render

                // Format articles
                data.results.forEach(function (article, index) {
                    // Escape url (fixme: does not include proxy_url!)
                    article._escaped_url = encodeURIComponent(article.url);
                    article._index = index;
                });

                // Render and display the results
                this.setMarkup(okanjo.ui.engine.render(templateName, this));

                // Track widget impression
                if (data.results.length === 0) {
                    // Hook point for no results found
                    this.emit('empty');
                    this._reportWidgetLoad('empty'); // decline the impression
                } else {
                    this._reportWidgetLoad();
                }

                // Bind interaction handlers and track impressions
                this.element.querySelectorAll('a').forEach(function (a) {

                    var id = a.getAttribute('data-id'),
                        index = a.getAttribute('data-index');

                    // Don't bind links that are not tile links
                    /* istanbul ignore else: custom templates could break this */
                    if (id && index >= 0) {
                        var article = _this17._response.data.results[index];
                        /* istanbul ignore else: custom templates could break this */
                        if (article) {

                            // Bind interaction listener
                            a.addEventListener('mousedown', _this17._handleResourceMouseDown.bind(_this17, Metrics.Object.article, article));
                            a.addEventListener('click', _this17._handleArticleClick.bind(_this17, article));

                            // Track impression
                            okanjo.metrics.create(_this17._metricBase, { id: article.id }).type(Metrics.Object.article, Metrics.Event.impression).meta(_this17.getConfig()).meta({ bf: article.backfill ? 1 : 0 }).element(a).viewport().send();

                            // Start watching for a viewable impression
                            _this17._addOnceViewedHandler(a, function () {
                                okanjo.metrics.create(_this17._metricBase, { id: article.id }).type(Metrics.Object.article, Metrics.Event.view).meta(_this17.getConfig()).meta({ bf: article.backfill ? 1 : 0 }).element(a).viewport().send();
                            });
                        }
                    }
                });

                // Truncate product name to fit the space
                this.element.querySelectorAll('.okanjo-resource-title').forEach(function (element) {
                    okanjo.ui.ellipsify(element);
                });

                // Hook point that the widget is done loading
                this.emit('load');
            }

            /**
             * Handles the article click process
             * @param article
             * @param e
             * @private
             */

        }, {
            key: '_handleArticleClick',
            value: function _handleArticleClick(article, e) {
                // Update the event
                if (!article._event || !article._additionalParams || !article._clickId) {
                    this._handleResourceMouseDown(Metrics.Object.article, article, e);
                }

                // Extract the already generated event and params list
                var event = article._event,
                    additionalParams = article._additionalParams;

                // Update the event to the current one

                event.event(e);

                // Update the link a second time, just in case the data changed
                e.currentTarget.href = this._getClickThroughURL(event, article.url, additionalParams);
            }

            //endregion

            //region ADX Handling

            /**
             * Renders a Google DFP/ADX response
             * @private
             */

        }, {
            key: '_showADX',
            value: function _showADX() {
                var _this18 = this;

                var data = (this._response || { data: { settings: {} } }).data || { settings: {} };

                // Get the template we should use to render the google ad
                var templateName = this._getTemplate(Placement.ContentTypes.adx, Placement.DefaultTemplates.adx);

                // Determine what size ad we can place here
                var size = null;
                if (this.config.size) {
                    if (Placement.Sizes[this.config.size]) {
                        // Defined size, use these known dimensions
                        size = Placement.Sizes[this.config.size];
                    } else {
                        var match = /^([0-9]+)x([0-9]+)$/i.exec(this.config.size);
                        if (match) {
                            size = { width: match[1], height: match[2] };
                        }
                    }
                }

                // No given size, we need to guess
                if (!size) size = Placement.Sizes.default;

                // If we're using okanjo's ad slot, then track the impression
                // otherwise decline it because we're just passing through to the publishers account
                var adUnitPath = '/90447967/okanjo:<publisher>';
                var declineReason = void 0;
                if (data.settings.display && data.settings.display.adx_unit_path) {
                    adUnitPath = data.settings.display.adx_unit_path;
                    declineReason = 'custom_ad_unit';
                }

                // Pass along what the template needs to know to display the ad
                var renderContext = {
                    size: size,
                    adUnitPath: adUnitPath
                };

                // Render the container
                this.setMarkup(okanjo.ui.engine.render(templateName, this, renderContext));

                // Report the impression
                this._reportWidgetLoad(declineReason);

                // Insert the actual ad into the container
                var container = this.element.querySelector('.okanjo-adx-container');
                /* istanbul ignore else: custom templates could break this */
                if (container) {

                    // Make the frame element
                    var frame = document.createElement('iframe');
                    var attributes = {
                        'class': 'okanjo-adx-frame',
                        frameborder: 0,
                        vspace: 0,
                        hspace: 0,
                        webkitallowfullscreen: '',
                        mozallowfullscreen: '',
                        allowfullscreen: '',
                        scrolling: 'auto',
                        width: size.width,
                        height: size.height
                    };

                    // Apply attributes
                    Object.keys(attributes).forEach(function (key) {
                        return frame.setAttribute(key, attributes[key]);
                    });

                    // Attach to dOM
                    container.appendChild(frame);

                    // Build a click-through tracking url so we know when an ad is clicked too
                    var clickUrl = okanjo.metrics.create(this._metricBase).type(Metrics.Object.thirdparty_ad, Metrics.Event.interaction).meta(this.getConfig()).meta({
                        ta_s: adUnitPath,
                        ta_w: size.width,
                        ta_h: size.height
                    }).element(frame).viewport().toUrl();

                    // Transfer references to the frame window
                    // frame.contentWindow.okanjo = okanjo;
                    // frame.contentWindow.placement = this;
                    frame.contentWindow.trackImpression = function () {
                        okanjo.metrics.create(_this18._metricBase).type(Metrics.Object.thirdparty_ad, Metrics.Event.impression).meta(_this18.getConfig()).meta({
                            ta_s: adUnitPath,
                            ta_w: size.width,
                            ta_h: size.height
                        }).element(frame).viewport().send();

                        // Start watching for a viewable impression
                        _this18._addOnceViewedHandler(frame, function () {
                            okanjo.metrics.create(_this18._metricBase).type(Metrics.Object.thirdparty_ad, Metrics.Event.view).meta(_this18.getConfig()).meta({
                                ta_s: adUnitPath,
                                ta_w: size.width,
                                ta_h: size.height
                            }).element(frame).viewport().send();
                        });
                    };

                    // Load Google ad!
                    frame.contentWindow.document.open();
                    frame.contentWindow.document.write('<html><head><style type="text/css">html,body {margin: 0; padding: 0;}</style></head><body>\n<' + ('script type="text/javascript" src="https://www.googletagservices.com/tag/js/gpt.js">\n    googletag.pubads().addEventListener(\'slotRenderEnded\', function(e) { \n        trackImpression(e);\n    });\n    googletag.pubads()\n        .definePassback("' + adUnitPath.replace(/"/g, '\\"') + '", [[' + size.width + ', ' + size.height + ']])\n        .setClickUrl("' + clickUrl + '&u=")\n        .display();\n<') + '/script>\n</body></html>');
                    frame.contentWindow.document.close();

                    // TODO future event hooks
                    // googletag.pubads().addEventListener('impressionViewable', function(e) { future )});
                    // googletag.pubads().addEventListener('slotOnload', function(e) { future });
                    // googletag.pubads().addEventListener('slotVisibilityChangedEvent', function(e) { future );

                    // Impression tracking is done from within the iframe. Crazy, right?
                }

                // Hook point that the widget is done loading
                this.emit('load');
            }

            //endregion

        }]);

        return Placement;
    }(okanjo._Widget);

    //region Enumerations

    /**
     * Standard ad sizes
     * @type {{billboard: {width: number, height: number}, button_2: {width: number, height: number}, half_page: {width: number, height: number}, leaderboard: {width: number, height: number}, medium_rectangle: {width: number, height: number}, micro_bar: {width: number, height: number}, portrait: {width: number, height: number}, rectangle: {width: number, height: number}, super_leaderboard: {width: number, height: number}, wide_skyscraper: {width: number, height: number}, large_mobile_banner: {width: number, height: number}, mobile_leaderboard: {width: number, height: number}, small_square: {width: number, height: number}, button_1: {width: number, height: number}, full_banner: {width: number, height: number}, half_banner: {width: number, height: number}, large_rectangle: {width: number, height: number}, pop_under: {width: number, height: number}, three_to_one_rectangle: {width: number, height: number}, skyscraper: {width: number, height: number}, square: {width: number, height: number}, square_button: {width: number, height: number}, vertical_banner: {width: number, height: number}, vertical_rectangle: {width: number, height: number}}}
     */


    Placement.Sizes = {

        // Supported
        medium_rectangle: { width: 300, height: 250 }, // aka: sidekick
        leaderboard: { width: 728, height: 90 },
        large_mobile_banner: { width: 320, height: 100 },
        half_page: { width: 300, height: 600 }, // aka: filmstrip, sidekick

        // IAB / Others
        billboard: { width: 970, height: 250 }, // aka: sidekick
        button_2: { width: 120, height: 60 },
        micro_bar: { width: 88, height: 31 },
        portrait: { width: 300, height: 1050 },
        rectangle: { width: 180, height: 150 },
        super_leaderboard: { width: 970, height: 90 }, // aka: pushdown, slider, large_leaderboard
        wide_skyscraper: { width: 160, height: 600 },

        // Google
        mobile_leaderboard: { width: 320, height: 50 },
        small_square: { width: 200, height: 200 },

        // Retired / Deprecated
        button_1: { width: 120, height: 90 },
        full_banner: { width: 468, height: 60 },
        half_banner: { width: 234, height: 60 },
        large_rectangle: { width: 336, height: 280 },
        pop_under: { width: 720, height: 300 },
        three_to_one_rectangle: { width: 300, height: 100 },
        skyscraper: { width: 120, height: 600 },
        square: { width: 250, height: 250 },
        square_button: { width: 125, height: 125 },
        vertical_banner: { width: 120, height: 240 },
        vertical_rectangle: { width: 240, height: 400 }
    };

    // When we should show an ad but nobody told us what size
    Placement.Sizes.default = Placement.Sizes.medium_rectangle;

    /**
     * Placement content types
     * @type {{products: string, articles: string, adx: string}}
     */
    Placement.ContentTypes = {
        products: 'products',
        articles: 'articles',
        adx: 'adx'
    };

    /**
     * Default templates for each content type
     * @type {{products: string, articles: string, adx: string}}
     */
    Placement.DefaultTemplates = {
        products: 'block2',
        articles: 'block2',
        adx: 'block2'
    };

    //endregion

    return okanjo.Placement = Placement;
})(window);
"use strict";

// **********
// DEPRECATED - USE okanjo.Placement instead!
// **********

//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function (window) {

    var okanjo = window.okanjo;

    /**
     * Backwards compatible interface, turning a Product widget into a placement widget
     * @deprecated
     */

    var Product = function (_okanjo$Placement) {
        _inherits(Product, _okanjo$Placement);

        function Product(element, options) {
            _classCallCheck(this, Product);

            // Initialize placement w/o loading (we need to jack the config)
            options = options || {};
            var no_init = options.no_init; // hold original no_init flag, if set
            options.no_init = true;

            var _this19 = _possibleConstructorReturn(this, (Product.__proto__ || Object.getPrototypeOf(Product)).call(this, element, options));

            okanjo.warn('Product widget has been deprecated. Use Placement instead (may require configuration changes)', { widget: _this19 });

            // Start loading content
            if (!no_init) {
                delete _this19.config.no_init;
                _this19.init();
            }
            return _this19;
        }

        //noinspection JSUnusedGlobalSymbols
        /**
         * Converts the old product widget configuration into a usable placement configuration
         */


        _createClass(Product, [{
            key: '_setCompatibilityOptions',
            value: function _setCompatibilityOptions() {
                // Convert the product config to a placement configuration
                this.config.backwards = 'Product';
                this.config.type = okanjo.Placement.ContentTypes.products;

                // Set filters based on old "mode"
                if (this.config.mode === 'sense') {
                    // sense
                    this.config.url = this.config.url || 'referrer';
                    this.config.take = this.config.take || 5;
                } else if (this.config.mode === 'single') {
                    // single
                    this.config.url = null;
                    if (this.config.id) this.config.ids = [this.config.id];
                    this.config.take = 1;
                    delete this.config.id;
                } else {
                    // browse
                    this.config.url = null;
                    this.config.take = this.config.take || 25;
                }
                delete this.config.mode;

                // Sold by changed to store name
                if (this.config.sold_by) {
                    this.config.store_name = this.config.sold_by;
                    delete this.config.sold_by;
                }

                // Selectors is now url_selectors
                if (this.config.selectors) {
                    this.config.url_selectors = this.config.selectors;
                    delete this.config.selectors;
                }

                // Marketplace_id is no longer a thing, closest analog are properties.
                if (this.config.marketplace_id) {
                    this.config.property_id = this.config.marketplace_id;
                    delete this.config.marketplace_id;
                }

                // Marketplace status is no longer a thing, instead, use the sandbox environment for testing
                if (this.config.marketplace_status === 'testing') {
                    this.config.sandbox = true;
                }
                delete this.config.marketplace_status;

                // Deprecated
                delete this.config.suboptimal;
                delete this.config.text;
            }
        }]);

        return Product;
    }(okanjo.Placement);

    return okanjo.Product = Product;
})(window);
"use strict";

// **********
// DEPRECATED - USE okanjo.Placement instead!
// **********

//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function (window) {

    var okanjo = window.okanjo;

    /**
     * Backwards compatible interface, turning an Ad widget into a placement widget
     * @deprecated
     */

    var Ad = function (_okanjo$Placement2) {
        _inherits(Ad, _okanjo$Placement2);

        function Ad(element, options) {
            _classCallCheck(this, Ad);

            // Initialize placement w/o loading (we need to jack the config)
            options = options || {};
            var no_init = options.no_init; // hold original no_init flag, if set
            options.no_init = true;

            var _this20 = _possibleConstructorReturn(this, (Ad.__proto__ || Object.getPrototypeOf(Ad)).call(this, element, options));

            okanjo.warn('Ad widget has been deprecated. Use Placement instead (may require configuration changes)', { widget: _this20 });

            // Start loading content
            if (!no_init) {
                delete _this20.config.no_init;
                _this20.init();
            }
            return _this20;
        }

        //noinspection JSUnusedGlobalSymbols
        /**
         * Converts the old product widget configuration into a usable placement configuration
         */


        _createClass(Ad, [{
            key: '_setCompatibilityOptions',
            value: function _setCompatibilityOptions() {
                // Convert the product config to a placement configuration
                this.config.backwards = 'Ad';
                this.config.type = okanjo.Placement.ContentTypes.products;

                // Id / single mode is now ids
                this.config.url = null;
                if (this.config.id) {
                    this.config.ids = [this.config.id];
                } else {
                    okanjo.warn('Ad widget should have parameter `id` set.');
                }
                this.config.take = 1;
                delete this.config.id;

                // Content is automatically determined whether the placement element contains children
                delete this.config.content;
            }
        }]);

        return Ad;
    }(okanjo.Placement);

    return okanjo.Ad = Ad;
})(window);
/* jshint ignore:start */

(function () {

    /*!
     * mustache.js - Logic-less {{mustache}} templates with JavaScript
     * http://github.com/janl/mustache.js
     */

    /*global define: false Mustache: true*/

    (function defineMustache(global, factory) {
        if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && exports && typeof exports.nodeName !== 'string') {
            factory(exports); // CommonJS
        } else if (typeof define === 'function' && define.amd) {
            define(['exports'], factory); // AMD
        } else {
            global.Mustache = {};
            factory(global.Mustache); // script, wsh, asp
        }
    })(this, function mustacheFactory(mustache) {

        var objectToString = Object.prototype.toString;
        var isArray = Array.isArray || function isArrayPolyfill(object) {
            return objectToString.call(object) === '[object Array]';
        };

        function isFunction(object) {
            return typeof object === 'function';
        }

        /**
         * More correct typeof string handling array
         * which normally returns typeof 'object'
         */
        function typeStr(obj) {
            return isArray(obj) ? 'array' : typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
        }

        function escapeRegExp(string) {
            return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
        }

        /**
         * Null safe way of checking whether or not an object,
         * including its prototype, has a given property
         */
        function hasProperty(obj, propName) {
            return obj != null && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && propName in obj;
        }

        // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
        // See https://github.com/janl/mustache.js/issues/189
        var regExpTest = RegExp.prototype.test;
        function testRegExp(re, string) {
            return regExpTest.call(re, string);
        }

        var nonSpaceRe = /\S/;
        function isWhitespace(string) {
            return !testRegExp(nonSpaceRe, string);
        }

        var entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };

        function escapeHtml(string) {
            return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
                return entityMap[s];
            });
        }

        var whiteRe = /\s*/;
        var spaceRe = /\s+/;
        var equalsRe = /\s*=/;
        var curlyRe = /\s*\}/;
        var tagRe = /#|\^|\/|>|\{|&|=|!/;

        /**
         * Breaks up the given `template` string into a tree of tokens. If the `tags`
         * argument is given here it must be an array with two string values: the
         * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
         * course, the default is to use mustaches (i.e. mustache.tags).
         *
         * A token is an array with at least 4 elements. The first element is the
         * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
         * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
         * all text that appears outside a symbol this element is "text".
         *
         * The second element of a token is its "value". For mustache tags this is
         * whatever else was inside the tag besides the opening symbol. For text tokens
         * this is the text itself.
         *
         * The third and fourth elements of the token are the start and end indices,
         * respectively, of the token in the original template.
         *
         * Tokens that are the root node of a subtree contain two more elements: 1) an
         * array of tokens in the subtree and 2) the index in the original template at
         * which the closing tag for that section begins.
         */
        function parseTemplate(template, tags) {
            if (!template) return [];

            var sections = []; // Stack to hold section tokens
            var tokens = []; // Buffer to hold the tokens
            var spaces = []; // Indices of whitespace tokens on the current line
            var hasTag = false; // Is there a {{tag}} on the current line?
            var nonSpace = false; // Is there a non-space char on the current line?

            // Strips all whitespace tokens array for the current line
            // if there was a {{#tag}} on it and otherwise only space.
            function stripSpace() {
                if (hasTag && !nonSpace) {
                    while (spaces.length) {
                        delete tokens[spaces.pop()];
                    }
                } else {
                    spaces = [];
                }

                hasTag = false;
                nonSpace = false;
            }

            var openingTagRe, closingTagRe, closingCurlyRe;
            function compileTags(tagsToCompile) {
                if (typeof tagsToCompile === 'string') tagsToCompile = tagsToCompile.split(spaceRe, 2);

                if (!isArray(tagsToCompile) || tagsToCompile.length !== 2) throw new Error('Invalid tags: ' + tagsToCompile);

                openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
                closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
                closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
            }

            compileTags(tags || mustache.tags);

            var scanner = new Scanner(template);

            var start, type, value, chr, token, openSection;
            while (!scanner.eos()) {
                start = scanner.pos;

                // Match any text between tags.
                value = scanner.scanUntil(openingTagRe);

                if (value) {
                    for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
                        chr = value.charAt(i);

                        if (isWhitespace(chr)) {
                            spaces.push(tokens.length);
                        } else {
                            nonSpace = true;
                        }

                        tokens.push(['text', chr, start, start + 1]);
                        start += 1;

                        // Check for whitespace on the current line.
                        if (chr === '\n') stripSpace();
                    }
                }

                // Match the opening tag.
                if (!scanner.scan(openingTagRe)) break;

                hasTag = true;

                // Get the tag type.
                type = scanner.scan(tagRe) || 'name';
                scanner.scan(whiteRe);

                // Get the tag value.
                if (type === '=') {
                    value = scanner.scanUntil(equalsRe);
                    scanner.scan(equalsRe);
                    scanner.scanUntil(closingTagRe);
                } else if (type === '{') {
                    value = scanner.scanUntil(closingCurlyRe);
                    scanner.scan(curlyRe);
                    scanner.scanUntil(closingTagRe);
                    type = '&';
                } else {
                    value = scanner.scanUntil(closingTagRe);
                }

                // Match the closing tag.
                if (!scanner.scan(closingTagRe)) throw new Error('Unclosed tag at ' + scanner.pos);

                token = [type, value, start, scanner.pos];
                tokens.push(token);

                if (type === '#' || type === '^') {
                    sections.push(token);
                } else if (type === '/') {
                    // Check section nesting.
                    openSection = sections.pop();

                    if (!openSection) throw new Error('Unopened section "' + value + '" at ' + start);

                    if (openSection[1] !== value) throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
                } else if (type === 'name' || type === '{' || type === '&') {
                    nonSpace = true;
                } else if (type === '=') {
                    // Set the tags for the next time around.
                    compileTags(value);
                }
            }

            // Make sure there are no open sections when we're done.
            openSection = sections.pop();

            if (openSection) throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

            return nestTokens(squashTokens(tokens));
        }

        /**
         * Combines the values of consecutive text tokens in the given `tokens` array
         * to a single token.
         */
        function squashTokens(tokens) {
            var squashedTokens = [];

            var token, lastToken;
            for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
                token = tokens[i];

                if (token) {
                    if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
                        lastToken[1] += token[1];
                        lastToken[3] = token[3];
                    } else {
                        squashedTokens.push(token);
                        lastToken = token;
                    }
                }
            }

            return squashedTokens;
        }

        /**
         * Forms the given array of `tokens` into a nested tree structure where
         * tokens that represent a section have two additional items: 1) an array of
         * all tokens that appear in that section and 2) the index in the original
         * template that represents the end of that section.
         */
        function nestTokens(tokens) {
            var nestedTokens = [];
            var collector = nestedTokens;
            var sections = [];

            var token, section;
            for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
                token = tokens[i];

                switch (token[0]) {
                    case '#':
                    case '^':
                        collector.push(token);
                        sections.push(token);
                        collector = token[4] = [];
                        break;
                    case '/':
                        section = sections.pop();
                        section[5] = token[2];
                        collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
                        break;
                    default:
                        collector.push(token);
                }
            }

            return nestedTokens;
        }

        /**
         * A simple string scanner that is used by the template parser to find
         * tokens in template strings.
         */
        function Scanner(string) {
            this.string = string;
            this.tail = string;
            this.pos = 0;
        }

        /**
         * Returns `true` if the tail is empty (end of string).
         */
        Scanner.prototype.eos = function eos() {
            return this.tail === '';
        };

        /**
         * Tries to match the given regular expression at the current position.
         * Returns the matched text if it can match, the empty string otherwise.
         */
        Scanner.prototype.scan = function scan(re) {
            var match = this.tail.match(re);

            if (!match || match.index !== 0) return '';

            var string = match[0];

            this.tail = this.tail.substring(string.length);
            this.pos += string.length;

            return string;
        };

        /**
         * Skips all text until the given regular expression can be matched. Returns
         * the skipped string, which is the entire tail if no match can be made.
         */
        Scanner.prototype.scanUntil = function scanUntil(re) {
            var index = this.tail.search(re),
                match;

            switch (index) {
                case -1:
                    match = this.tail;
                    this.tail = '';
                    break;
                case 0:
                    match = '';
                    break;
                default:
                    match = this.tail.substring(0, index);
                    this.tail = this.tail.substring(index);
            }

            this.pos += match.length;

            return match;
        };

        /**
         * Represents a rendering context by wrapping a view object and
         * maintaining a reference to the parent context.
         */
        function Context(view, parentContext) {
            this.view = view;
            this.cache = { '.': this.view };
            this.parent = parentContext;
        }

        /**
         * Creates a new context using the given view with this context
         * as the parent.
         */
        Context.prototype.push = function push(view) {
            return new Context(view, this);
        };

        /**
         * Returns the value of the given name in this context, traversing
         * up the context hierarchy if the value is absent in this context's view.
         */
        Context.prototype.lookup = function lookup(name) {
            var cache = this.cache;

            var value;
            if (cache.hasOwnProperty(name)) {
                value = cache[name];
            } else {
                var context = this,
                    names,
                    index,
                    lookupHit = false;

                while (context) {
                    if (name.indexOf('.') > 0) {
                        value = context.view;
                        names = name.split('.');
                        index = 0;

                        /**
                         * Using the dot notion path in `name`, we descend through the
                         * nested objects.
                         *
                         * To be certain that the lookup has been successful, we have to
                         * check if the last object in the path actually has the property
                         * we are looking for. We store the result in `lookupHit`.
                         *
                         * This is specially necessary for when the value has been set to
                         * `undefined` and we want to avoid looking up parent contexts.
                         **/
                        while (value != null && index < names.length) {
                            if (index === names.length - 1) lookupHit = hasProperty(value, names[index]);

                            value = value[names[index++]];
                        }
                    } else {
                        value = context.view[name];
                        lookupHit = hasProperty(context.view, name);
                    }

                    if (lookupHit) break;

                    context = context.parent;
                }

                cache[name] = value;
            }

            if (isFunction(value)) value = value.call(this.view);

            return value;
        };

        /**
         * A Writer knows how to take a stream of tokens and render them to a
         * string, given a context. It also maintains a cache of templates to
         * avoid the need to parse the same template twice.
         */
        function Writer() {
            this.cache = {};
        }

        /**
         * Clears all cached templates in this writer.
         */
        Writer.prototype.clearCache = function clearCache() {
            this.cache = {};
        };

        /**
         * Parses and caches the given `template` and returns the array of tokens
         * that is generated from the parse.
         */
        Writer.prototype.parse = function parse(template, tags) {
            var cache = this.cache;
            var tokens = cache[template];

            if (tokens == null) tokens = cache[template] = parseTemplate(template, tags);

            return tokens;
        };

        /**
         * High-level method that is used to render the given `template` with
         * the given `view`.
         *
         * The optional `partials` argument may be an object that contains the
         * names and templates of partials that are used in the template. It may
         * also be a function that is used to load partial templates on the fly
         * that takes a single argument: the name of the partial.
         */
        Writer.prototype.render = function render(template, view, partials) {
            var tokens = this.parse(template);
            var context = view instanceof Context ? view : new Context(view);
            return this.renderTokens(tokens, context, partials, template);
        };

        /**
         * Low-level method that renders the given array of `tokens` using
         * the given `context` and `partials`.
         *
         * Note: The `originalTemplate` is only ever used to extract the portion
         * of the original template that was contained in a higher-order section.
         * If the template doesn't use higher-order sections, this argument may
         * be omitted.
         */
        Writer.prototype.renderTokens = function renderTokens(tokens, context, partials, originalTemplate) {
            var buffer = '';

            var token, symbol, value;
            for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
                value = undefined;
                token = tokens[i];
                symbol = token[0];

                if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate);else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate);else if (symbol === '>') value = this.renderPartial(token, context, partials, originalTemplate);else if (symbol === '&') value = this.unescapedValue(token, context);else if (symbol === 'name') value = this.escapedValue(token, context);else if (symbol === 'text') value = this.rawValue(token);

                if (value !== undefined) buffer += value;
            }

            return buffer;
        };

        Writer.prototype.renderSection = function renderSection(token, context, partials, originalTemplate) {
            var self = this;
            var buffer = '';
            var value = context.lookup(token[1]);

            // This function is used to render an arbitrary template
            // in the current context by higher-order sections.
            function subRender(template) {
                return self.render(template, context, partials);
            }

            if (!value) return;

            if (isArray(value)) {
                for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
                    buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
                }
            } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' || typeof value === 'string' || typeof value === 'number') {
                buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
            } else if (isFunction(value)) {
                if (typeof originalTemplate !== 'string') throw new Error('Cannot use higher-order sections without the original template');

                // Extract the portion of the original template that the section contains.
                value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

                if (value != null) buffer += value;
            } else {
                buffer += this.renderTokens(token[4], context, partials, originalTemplate);
            }
            return buffer;
        };

        Writer.prototype.renderInverted = function renderInverted(token, context, partials, originalTemplate) {
            var value = context.lookup(token[1]);

            // Use JavaScript's definition of falsy. Include empty arrays.
            // See https://github.com/janl/mustache.js/issues/186
            if (!value || isArray(value) && value.length === 0) return this.renderTokens(token[4], context, partials, originalTemplate);
        };

        Writer.prototype.renderPartial = function renderPartial(token, context, partials) {
            if (!partials) return;

            var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
            if (value != null) return this.renderTokens(this.parse(value), context, partials, value);
        };

        Writer.prototype.unescapedValue = function unescapedValue(token, context) {
            var value = context.lookup(token[1]);
            if (value != null) return value;
        };

        Writer.prototype.escapedValue = function escapedValue(token, context) {
            var value = context.lookup(token[1]);
            if (value != null) return mustache.escape(value);
        };

        Writer.prototype.rawValue = function rawValue(token) {
            return token[1];
        };

        mustache.name = 'mustache.js';
        mustache.version = '2.3.0';
        mustache.tags = ['{{', '}}'];

        // All high-level mustache.* functions use this writer.
        var defaultWriter = new Writer();

        /**
         * Clears all cached templates in the default writer.
         */
        mustache.clearCache = function clearCache() {
            return defaultWriter.clearCache();
        };

        /**
         * Parses and caches the given template in the default writer and returns the
         * array of tokens it contains. Doing this ahead of time avoids the need to
         * parse templates on the fly as they are rendered.
         */
        mustache.parse = function parse(template, tags) {
            return defaultWriter.parse(template, tags);
        };

        /**
         * Renders the `template` with the given `view` and `partials` using the
         * default writer.
         */
        mustache.render = function render(template, view, partials) {
            if (typeof template !== 'string') {
                throw new TypeError('Invalid template! Template should be a "string" ' + 'but "' + typeStr(template) + '" was given as the first ' + 'argument for mustache#render(template, view, partials)');
            }

            return defaultWriter.render(template, view, partials);
        };

        // This is here for backwards compatibility with 0.4.x.,
        /*eslint-disable */ // eslint wants camel cased function name
        mustache.to_html = function to_html(template, view, partials, send) {
            /*eslint-enable*/

            var result = mustache.render(template, view, partials);

            if (isFunction(send)) {
                send(result);
            } else {
                return result;
            }
        };

        // Export the escaping function so that the user may override it.
        // See https://github.com/janl/mustache.js/issues/244
        mustache.escape = escapeHtml;

        // Export these mainly for testing, but also for advanced usage.
        mustache.Scanner = Scanner;
        mustache.Context = Context;
        mustache.Writer = Writer;

        return mustache;
    });
}).apply(okanjo.lib);

/* jshint ignore:end */
return okanjo;
}));
