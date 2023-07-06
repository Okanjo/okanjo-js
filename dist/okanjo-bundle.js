/*! okanjo-js v3.5.1 | (c) 2013 Okanjo Partners Inc | https://okanjo.com/ */
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.okanjo = factory();
  }
}(this, function() {
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

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
    }; // The length property of the from method is 1.


    return function from(arrayLike
    /*, mapFn, thisArg */
    ) {
      // 1. Let C be the this value.
      var C = this; // 2. Let items be ToObject(arrayLike).

      var items = Object(arrayLike); // 3. ReturnIfAbrupt(items).

      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
      } // 4. If mapfn is undefined, then let mapping be false.


      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;

      if (typeof mapFn !== 'undefined') {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        } // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.


        if (arguments.length > 2) {
          T = arguments[2];
        }
      } // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).


      var len = toLength(items.length); // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method
      // of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).

      var A = isCallable(C) ? Object(new C(len)) : new Array(len); // 16. Let k be 0.

      var k = 0; // 17. Repeat, while k < len… (also steps a - h)

      var kValue;

      while (k < len) {
        kValue = items[k];

        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }

        k += 1;
      } // 18. Let putStatus be Put(A, "length", len, true).


      A.length = len; // 20. Return A.

      return A;
    };
  }();
} // https://tc39.github.io/ecma262/#sec-array.prototype.find


if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function value(predicate) {
      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this); // 2. Let len be ? ToLength(? Get(O, "length")).

      var len = o.length >>> 0; // 3. If IsCallable(predicate) is false, throw a TypeError exception.

      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      } // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.


      var thisArg = arguments[1]; // 5. Let k be 0.

      var k = 0; // 6. Repeat, while k < len

      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];

        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        } // e. Increase k by 1.


        k++;
      } // 7. Return undefined.


      return undefined;
    }
  });
} // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex


if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function value(predicate) {
      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this); // 2. Let len be ? ToLength(? Get(O, "length")).

      var len = o.length >>> 0; // 3. If IsCallable(predicate) is false, throw a TypeError exception.

      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      } // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.


      var thisArg = arguments[1]; // 5. Let k be 0.

      var k = 0; // 6. Repeat, while k < len

      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return k.
        var kValue = o[k];

        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        } // e. Increase k by 1.


        k++;
      } // 7. Return -1.


      return -1;
    }
  });
} // https://tc39.github.io/ecma262/#sec-array.prototype.includes


if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function value(searchElement, fromIndex) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      } // 1. Let O be ? ToObject(this value).


      var o = Object(this); // 2. Let len be ? ToLength(? Get(O, "length")).

      var len = o.length >>> 0; // 3. If len is 0, return false.

      if (len === 0) {
        return false;
      } // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)


      var n = fromIndex | 0; // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.

      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y);
      } // 7. Repeat, while k < len


      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        if (sameValueZero(o[k], searchElement)) {
          return true;
        } // c. Increase k by 1.


        k++;
      } // 8. Return false


      return false;
    }
  });
} // https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach


if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;

    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign


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
/* exported okanjo */
//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols

/**
 * Okanjo widget framework namespace
 * @global okanjo
 */


var okanjo = function (window, document) {
  // eslint-disable-line no-unused-vars
  //region Constants
  // Environment Vars
  var SUPPORTS_PAGE_OFFSET = window.pageXOffset !== undefined;
  var CSS1_COMPATIBLE = (document.compatMode ||
  /* istanbul ignore next: out of scope */
  "") === "CSS1Compat";
  var AGENT = window.navigator.userAgent;
  var ELLIPSIFY_PATTERN = /[\s\S](?:\.\.\.)?$/;
  var MOBILE_PATTERN = /(iPhone|iPad|iPod|Android|blackberry)/i;

  var NOOP = function NOOP() {};

  var Console = window.console; // Place to pull defaults, if already set

  var settings = window.okanjo || {}; //endregion
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
    version: "3.5.1",

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
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
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
        args.push({
          reportStack: stack.join('\n')
        });
        args = args.filter(function (a) {
          return a !== err;
        });
      }

      Console.error("[Okanjo v".concat(okanjo.version, "]: ").concat(err.stack));
      args.length && Console.error.apply(Console, ['Additional information:'].concat(args)); // TODO - integrate with Raven
    },

    /**
     * Warn developers of their misdeeds
     * @param message
     * @param args
     */
    warn: function warn(message) {
      var err = new Error(message);
      Console.warn("[Okanjo v".concat(okanjo.version, "]: ").concat(err.stack));

      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      args.length && Console.warn.apply(Console, ['Additional information:'].concat(args));
    },
    // Backwards compatibility when we shipped with qwery, cuz querySelector[All] wasn't mainstream enough
    qwery: function qwery(selector, parent) {
      // If parent is a selector, select the parent first!
      if (typeof parent === "string") {
        parent = document.querySelector(parent); // If parent is not found, there are obviously no results

        if (!parent) return [];
      }

      if (!parent) parent = document;
      return parent.querySelectorAll(selector);
    }
  }; //endregion
  //region Vendor Libs

  /**
   * Placeholder for where vendor libraries get no-conflict loaded
   * @type {{}}
   */

  okanjo.lib = {}; //endregion
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
          route = route.replace(":".concat(key), params[key] + "");
        });
      }

      env = env || okanjo.env || 'live';
      return (env === 'sandbox' ? okanjo.net.sandboxEndpoint : okanjo.net.endpoint) + route;
    },
    // placeholder, xhr request extension
    request: NOOP
  }; //endregion
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
          var key, value;

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
    },

    /**
     * Returns the value if defined and not null
     * @param val Value to use if defined
     * @returns {*|null} Defined value or null
     */
    ifDefined: function ifDefined(val) {
      return typeof val !== "undefined" && val !== null ? val : null;
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
    } else if (_typeof(mixed) === "object" && mixed !== null) {
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
          done,
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

    var counter, previousSeconds;
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
  /**
   * Gets the best URL for where we are operating
   * @returns {string|*}
   */


  okanjo.util.getLocation = function () {
    /* istanbul ignore if: hard to reproduce in jsdom at the moment */
    if (window.location !== window.parent.location) {
      // attempt to see if the frame is friendly and get the parent
      try {
        return window.parent.location.href;
      } catch (e) {// Not friendly :(
      } // prefer the frame referrer (at least the same as the origin site) over the ad server url


      if (document.referrer) return document.referrer;
      return document.referrer;
    } // Direct on page or frame is goofy


    return window.location.href;
  }; //endregion
  //region User Interface


  okanjo.ui = {
    /**
     * Gets the current page scroll position
     * @returns {{x: Number, y: Number}}
     */
    getScrollPosition: function getScrollPosition() {
      return {
        x: SUPPORTS_PAGE_OFFSET ? window.pageXOffset :
        /* istanbul ignore next: old browsers */
        CSS1_COMPATIBLE ? document.documentElement.scrollLeft : document.body.scrollLeft,
        y: SUPPORTS_PAGE_OFFSET ? window.pageYOffset :
        /* istanbul ignore next: old browsers */
        CSS1_COMPATIBLE ? document.documentElement.scrollTop : document.body.scrollTop
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
      var element = CSS1_COMPATIBLE ? document.documentElement :
      /* istanbul ignore next: browser diffs */
      document.body;
      var width = element.clientWidth;
      var height = element.clientHeight;
      var inWidth = window.innerWidth ||
      /* istanbul ignore next: browser diffs */
      0;
      var inHeight = window.innerHeight ||
      /* istanbul ignore next: browser diffs */
      0;
      var isMobileZoom = inWidth && width > inWidth || inHeight && height > inHeight;
      return {
        vw: isMobileZoom ?
        /* istanbul ignore next: browser diffs */
        inWidth : width,
        vh: isMobileZoom ?
        /* istanbul ignore next: browser diffs */
        inHeight : height
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
        et: type,
        // mouse? touch? keyboard? robot?
        ex: ex === undefined
        /* istanbul ignore next: browser diffs */
        ? event.clientX + body[scrollLeft] + el[scrollLeft] : ex,
        ey: ey === undefined
        /* istanbul ignore next: browser diffs */
        ? event.clientY + body[scrollTop] + el[scrollTop] : ey
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
        var body = document.body.getBoundingClientRect(); // let pos = okanjo.ui.getScrollPosition();

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
        okanjo.report(err, {
          exception: e,
          element: element
        });
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
     * Checks whether the element is actually displayed on the DOM
     * @param element
     * @return {boolean}
     */
    isElementVisible: function isElementVisible(element) {
      /* istanbul ignore next: jsdom won't trigger this */
      return element.offsetWidth > 0 && element.offsetHeight > 0;
    },

    /**
     * Gets the percentage of the element pixels currently within the viewport
     * @param {HTMLElement|Node} element
     * @returns {{intersectionArea: number, percentage: number, elementArea: number}|{intersectionArea: null, percentage: number, elementArea: null}}
     */
    getPercentageInViewport: function getPercentageInViewport(element) {
      var e = okanjo.ui.getElementPosition(element),
          s = okanjo.ui.getScrollPosition(),
          v = okanjo.ui.getViewportSize(); // If there was a problem getting the element position, fail fast

      if (e.err) return {
        percentage: 0,
        elementArea: null,
        intersectionArea: null
      }; // Get intersection rectangle

      var _okanjo$ui$_getInters = okanjo.ui._getIntersection(e, s, v),
          intersectionArea = _okanjo$ui$_getInters.intersectionArea,
          elementArea = _okanjo$ui$_getInters.elementArea; // Don't let it return NaN

      /* istanbul ignore else: jsdom no love positional data */


      if (elementArea <= 0) return {
        percentage: 0,
        elementArea: elementArea,
        intersectionArea: intersectionArea
      };
      /* istanbul ignore next: jsdom no love positional data, area tested with helper fn tho */

      return {
        percentage: intersectionArea / elementArea,
        elementArea: elementArea,
        intersectionArea: intersectionArea
      };
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

    var text = useTextContent ? element.textContent :
    /* istanbul ignore next: browser diffs */
    element.innerText,
        replacedText = "",
        safety = 5000,
        // Safety switch to bust out of the loop in the event something goes terribly wrong
    replacer =
    /* istanbul ignore next: n/a to jsdom */
    function replacer(match) {
      replacedText = match.substring(0, match.length - 3) + replacedText;
      return '...';
    }; // Trim off characters until we can fit the text and ellipses
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
    } // If there is work to do, split the content into two span tags
    // Like so: [content]...[hidden content]

    /* istanbul ignore if: n/a to jsdom */


    if (replacedText.length > 0) {
      var content = document.createElement('span'),
          span = document.createElement('span');
      content.setAttribute('class', 'okanjo-ellipses');
      span.setAttribute('class', 'okanjo-visually-hidden');

      if (useTextContent) {
        content.textContent = text.substring(0, text.length - 3);
        span.textContent = replacedText;
      } else {
        content.innerText = text.substring(0, text.length - 3);
        span.innerText = replacedText;
      }

      element.innerHTML = '';
      element.appendChild(content);
      element.appendChild(span);
    }
  };
  /**
   * Locates images with the class okanjo-fit and ensures that they get filled.
   * This is basically a object-fit hacky workaround
   * @param element
   */


  okanjo.ui.fitImages = function (element) {
    // Detect objectFit support

    /* istanbul ignore if: jsdom has objectFit defined and refuses to let you hack it */
    if (!('objectFit' in document.documentElement.style)) {
      // Find images to fit
      element.querySelectorAll('img.okanjo-fit').forEach(function (img) {
        // Hide the image
        img.style.display = 'none'; // Update the parent w/ the background

        var parent = img.parentNode;
        parent.style.backgroundSize = 'cover';
        parent.style.backgroundImage = 'url(' + img.src + ')';
        parent.style.backgroundposition = 'center center';
      });
    }
  };
  /**
   * Returns the SVG content for an article icon
   * @return {string}
   */


  okanjo.ui.articleSVG = function () {
    return "<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 48 48\" style=\"enable-background:new 0 0 48 48;\" xml:space=\"preserve\"> <g id=\"newspaper_1_\"> <g id=\"newspaper_2_\"> <path id=\"newspaper_6_\" d=\"M21.5,23h-5c-0.276,0-0.5-0.224-0.5-0.5v-5c0-0.276,0.224-0.5,0.5-0.5h5c0.276,0,0.5,0.224,0.5,0.5v5 C22,22.776,21.776,23,21.5,23z M37,32c0,1.654-1.346,3-3,3h-2H15c-1.654,0-3-1.346-3-3V14c0-0.552,0.448-1,1-1h17 c0.552,0,1,0.448,1,1v18c0,0.552,0.449,1,1,1h2c0.551,0,1-0.448,1-1V17h-1v14.75c0,0.138-0.112,0.25-0.25,0.25h-1.5 C32.112,32,32,31.888,32,31.75V16c0-0.552,0.448-1,1-1h3c0.552,0,1,0.448,1,1v1V32z M15,33h14.184C29.072,32.686,29,32.352,29,32 V15H14v17C14,32.552,14.449,33,15,33z M26.5,19h-2c-0.276,0-0.5-0.224-0.5-0.5v-1c0-0.276,0.224-0.5,0.5-0.5h2 c0.276,0,0.5,0.224,0.5,0.5v1C27,18.776,26.776,19,26.5,19z M26.5,23h-2c-0.276,0-0.5-0.224-0.5-0.5v-1c0-0.276,0.224-0.5,0.5-0.5 h2c0.276,0,0.5,0.224,0.5,0.5v1C27,22.776,26.776,23,26.5,23z M26.5,27h-10c-0.276,0-0.5-0.224-0.5-0.5v-1 c0-0.276,0.224-0.5,0.5-0.5h10c0.276,0,0.5,0.224,0.5,0.5v1C27,26.776,26.776,27,26.5,27z M26.5,31h-10 c-0.276,0-0.5-0.224-0.5-0.5v-1c0-0.276,0.224-0.5,0.5-0.5h10c0.276,0,0.5,0.224,0.5,0.5v1C27,30.776,26.776,31,26.5,31z\"/> </g> </g> </svg>";
  };
  /**
   * Returns the SVG content for a product icon
   * @return {string}
   */


  okanjo.ui.productSVG = function () {
    return "<svg id=\"glyphicons-basic\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\"> <path id=\"cart\" d=\"M13,26.5A1.5,1.5,0,1,1,11.5,25,1.5,1.5,0,0,1,13,26.5ZM21.5,25A1.5,1.5,0,1,0,23,26.5,1.5,1.5,0,0,0,21.5,25ZM27.96436,8.82544l-2,9A1.49988,1.49988,0,0,1,24.5,19H11.77l.4375,2H23a1,1,0,0,1,1,1v1a1,1,0,0,1-1,1H11a1.5,1.5,0,0,1-1.46533-1.17944L6.29248,8H4A1,1,0,0,1,3,7V6A1,1,0,0,1,4,5H7.5A1.49993,1.49993,0,0,1,8.96533,6.17944L9.14484,7H26.5a1.50029,1.50029,0,0,1,1.46436,1.82544ZM24.62988,10H9.80115l1.31256,6H23.29688Z\"/></svg>";
  };
  /**
   * Returns the inline SVG src attribute
   * @param svg
   * @return {string}
   */


  okanjo.ui.inlineSVG = function (svg) {
    return 'data:image/svg+xml;base64,' + btoa('<?xml version="1.0" encoding="UTF-8" standalone="no"?>' + svg);
  }; //endregion
  // Export the root namespace


  return window.okanjo = okanjo;
}(window, document);

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
    } // Create a new instance


    var req = new (window.XMLHttpRequest ||
    /* istanbul ignore next: old ie */
    window.ActiveXObject)('MSXML2.XMLHTTP.3.0'); // Flag to prevent duplicate callbacks / races

    var calledBack = false; // Normalized done handler

    var done = function done(err, res) {
      /* istanbul ignore else: out of scope */
      if (!calledBack) {
        calledBack = true;
        callback(err, res);
      }
    }; // Apply timeout if configured globally


    if (okanjo.net.request.timeout) {
      req.timeout = okanjo.net.request.timeout;
    } // Catch timeout errors


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
    }; // Handle the response


    req.onreadystatechange = function (e) {
      // 4 = completed / failed
      if (req.readyState === 4) {
        // Do we have a response?
        if (req.status > 0) {
          var res; // Check if we got JSON and parse it right away

          if (JSON_TEST.test(req.getResponseHeader('Content-Type'))) {
            res = JSON.parse(req.responseText);
          } else {
            // Not JSON, normalize it instead
            res = {
              statusCode: req.status,
              data: req.responseText
            };
          } // Put the response in the proper slot (err for non success responses)


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
    }; // Open the request


    req.open(method.toUpperCase(), url); // Include credentials

    req.withCredentials = true; // Handle post payloads

    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');

      if (payload !== undefined) {
        payload = JSON.stringify(payload);
      }
    } // Ship it


    req.send(payload || undefined);
  }; // Bind helpers to make things easy as pie


  okanjo.net.request.get = okanjo.net.request.bind(this, 'GET');
  okanjo.net.request.post = okanjo.net.request.bind(this, 'POST');
  okanjo.net.request.put = okanjo.net.request.bind(this, 'PUT');
  okanjo.net.request["delete"] = okanjo.net.request.bind(this, 'DELETE');
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
      return "".concat(keyPrefix, "[").concat(encode(key), "]");
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
      } else if (_typeof(value) === "object" && value !== null) {
        // Recurse
        var res = okanjo.net.request.stringify(value, getKey(key, keyPrefix));
        if (res) pairs.push(res);
      } else if (value !== undefined) {
        pairs.push(getKey(key, keyPrefix) + '=' + encode(value));
      }
    });
    return pairs.join('&');
  };
})(window); //noinspection ThisExpressionReferencesGlobalObjectJS


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
      var secure = window.location.protocol === 'https:' ? ' Secure;' : ''; // const secure = ' Secure;';

      var cookieValue = "".concat(encodeURI(value), ";").concat(expires).concat(secure, " SameSite=None;").concat(path); // console.log('setting cookie', cookieName, cookieValue)

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
})(window, document); //noinspection JSUnusedLocalSymbols,ThisExpressionReferencesGlobalObjectJS


(function (window, document) {
  var okanjo = window.okanjo;
  /**
   * UI Rendering Engine
   */

  var TemplateEngine = /*#__PURE__*/function () {
    function TemplateEngine() {
      _classCallCheck(this, TemplateEngine);

      // Load initial templates from options
      this._templates = {};
      this._css = {}; // Hook point for adding custom styles to ui elements

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
      key: "registerTemplate",
      value: function registerTemplate(name, template, beforeRender, options) {
        if (_typeof(template) === "object") {
          //noinspection JSValidateTypes
          if (template.nodeType === undefined) {
            throw new Error('Parameter template must be a string or a DOM element');
          } else {
            template = template.innerHTML;
            okanjo.lib.Mustache.parse(template);
          }
        } else if (typeof template !== "string") {
          throw new Error('Parameter template must be a string or a DOM element');
        } // Shift options if only have 3 params


        if (arguments.length === 3 && _typeof(beforeRender) === "object") {
          options = beforeRender;
          beforeRender = null;
        } else {
          options = options || {};
        }

        if (beforeRender && typeof beforeRender !== "function") {
          throw new Error('Parameter beforeRender must be a function');
        } // Assign the template


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
      key: "registerCss",
      value: function registerCss(name, css, options) {
        options = options || {};

        if (_typeof(css) === "object") {
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
      key: "isTemplateRegistered",
      value: function isTemplateRegistered(name) {
        return !!this._templates[name];
      } //noinspection JSUnusedGlobalSymbols

      /**
       * Checks whether a CSS payload is registered
       * @param name
       * @return {boolean}
       */

    }, {
      key: "isCssRegistered",
      value: function isCssRegistered(name) {
        return !!this._css[name];
      }
      /**
       * Ensures that a CSS payload has been added to the DOM
       * @param name
       */

    }, {
      key: "ensureCss",
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
                style.textContent = css.markup;
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
       * Ensures that a custom CSS stylesheet has been added to the DOM
       * @param url
       */

    }, {
      key: "ensureExternalCss",
      value: function ensureExternalCss(url) {
        var id = 'okanjo-custom-css-' + url;
        if (document.getElementById(id)) return;
        var head = document.head,
            link = document.createElement('link');
        link.id = id;
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', url);

        if (head) {
          head.appendChild(link);
        } else {
          // NO HEAD, just prepend to body then
          var body = document.body;

          if (body) {
            body.appendChild(link);
          } else {
            // And if this doesn't work, just give up
            okanjo.report('Cannot add custom CSS stylesheet to document. Does it not have a body or head?');
          }
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
      key: "render",
      value: function render(templateName, context, model) {
        var _this = this;

        model = model || {};
        var template = this._templates[templateName]; // If there's a data controller closure set, and if so, run the data through there

        if (template.beforeRender) {
          model = template.beforeRender.call(context, model);
        } // Attach globals


        model.okanjo = okanjo;
        model.okanjoMetricUrl = okanjo.net.endpoint.replace(/^https?:\/\//, ''); // Url w/o scheme to prevent mixed-content warnings

        model.now = function () {
          return new Date().getTime();
        };

        model.classDetects = this.classDetects; //noinspection JSUnresolvedVariable

        if (model.blockClasses && Array.isArray(model.blockClasses)) {
          model.classDetects += " " + model.blockClasses.join(' ');
          delete model.blockClasses;
        } // Add CSS unless we are told not to


        if (model.css !== false && template.options.css && template.options.css.length > 0) {
          template.options.css.forEach(function (css) {
            return _this.ensureCss(css);
          });
          delete model.css;
        } // Render the template and return the result


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
  }; // Export


  okanjo.ui.engine = new TemplateEngine();
})(window, document); //noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols


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
  $html,
      $body,
      $modalContainer,
      $modalWindow,
      $modalSkin,
      $modalOuter,
      $modalInner,
      $modalClose,
      $modalFrame,
      createElements = function createElements() {
    // Page elements
    //noinspection JSUnresolvedFunction
    $html = document.documentElement ||
    /* istanbul ignore next: old browsers */
    document.querySelector('html'); //noinspection JSUnresolvedFunction

    $body = document.body ||
    /* istanbul ignore next: old browsers */
    document.querySelector('body'); // Modal elements

    $modalContainer = document.createElement('div');
    $modalWindow = document.createElement('div');
    $modalSkin = document.createElement('div');
    $modalOuter = document.createElement('div');
    $modalInner = document.createElement('div');
    $modalClose = document.createElement('div');
    $modalFrame = document.createElement('iframe');
    $modalContainer.setAttribute('class', 'okanjo-modal-container okanjo-modal-hidden '
    /*+ okanjo.util.detectClasses().join(' ')*/
    );
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
    $modalClose.innerHTML = '×'; // Create the modal element tree

    $modalInner.appendChild($modalFrame);
    $modalOuter.appendChild($modalInner);
    $modalSkin.appendChild($modalOuter);
    $modalWindow.appendChild($modalSkin);
    $modalWindow.appendChild($modalClose);
    $modalContainer.appendChild($modalWindow); // Add the modal stuff to the body

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
    return window.innerHeight ||
    /* istanbul ignore next: old browsers */
    document.documentElement.clientHeight;
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
    }); // If the window changes size, also adjust the modal view port

    addListener(window, 'resize', function () {
      setTimeout(handleReposition, 100);
    }); // Click the overlay to close the modal

    addListener($modalContainer, 'click', closeModal); // If you click in the modal, don't close it!

    addListener($modalWindow, 'click', function (e) {
      e.preventDefault();
      e.stopPropagation();
    }); // Click the close button to close it

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
    }, 10); // Click the overlay to close the modal
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
    }, 210); // Click the overlay to close the modal
    //removeListener($body, 'click', closeModal);
  },

  /**
   * Insert an element or markup into the modal
   * @param content
   */
  setContent = function setContent(content) {
    // Remove existing content
    $modalInner.innerHTML = ""; // Insert new content

    if (typeof content === "string") {
      $modalInner.innerHTML = content;
    } else {
      $modalInner.appendChild(content);
    }
  }; // Expose the modal functions


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
})(window, document); //noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols


(function (window, document) {
  var okanjo = window.okanjo;
  /**
   * Event tracking class
   * @type {Metrics}
   */

  var Metrics = /*#__PURE__*/function () {
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
      this.sourceCx = null; // Extract referral data, if set

      this._checkUrlForReferral(); // TODO - look into iframe session correlation system

    } //noinspection JSMethodCanBeStatic

    /**
     * Gets the storage backed metric queue, in case we did not send everything last time
     * @return {Array}
     * @private
     */


    _createClass(Metrics, [{
      key: "_getStoredQueue",
      value: function _getStoredQueue() {
        if (window.localStorage[Metrics.Params.queue]) {
          try {
            var queue = JSON.parse(window.localStorage[Metrics.Params.queue]);

            if (Array.isArray(queue)) {
              return queue;
            } else {
              okanjo.report('Stored queue is not a queue', {
                queue: queue
              });
              return [];
            }
          } catch (e) {
            okanjo.report('Failed to load metric queue from storage', {
              err: e
            });
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
      key: "_saveQueue",
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
      key: "_checkUrlForReferral",
      value: function _checkUrlForReferral() {
        var pageArgs = okanjo.util.getPageArguments(true),
            urlSid = pageArgs[Metrics.Params.name],
            localSid = window.localStorage[Metrics.Params.name] || okanjo.util.cookie.get(Metrics.Params.name),
            // pull from storage or cookie
        sourceContext = pageArgs[Metrics.Params.context],
            sourceChannel = pageArgs[Metrics.Params.channel]; // If for some reason, both are set, record the incident as a possible correlation

        if (urlSid && localSid && urlSid !== localSid) {
          this.trackEvent({
            object_type: Metrics.Object.metric_session,
            event_type: Metrics.Event.correlation,
            id: urlSid + "_" + localSid,
            ch: this.defaultChannel,
            _noProcess: true
          });
        } // Update local values


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
      key: "trackEvent",
      value: function trackEvent(event, callback) {
        // Ensure the event contains the required fields
        if (!event.object_type || !event.event_type) {
          okanjo.report('Invalid metric to track (missing object_type or event_type)', {
            event: event
          });
          return;
        } // Queue the event for publishing


        this._push(event, callback);
      } //noinspection JSUnusedGlobalSymbols

      /**
       * Submits a page view metric
       * @param event
       * @param callback
       */

    }, {
      key: "trackPageView",
      value: function trackPageView(event, callback) {
        event = event || {};
        event.object_type = Metrics.Object.page;
        event.event_type = Metrics.Event.view;
        event.id = event.id || okanjo.util.getLocation();
        event.ch = event.ch || this.defaultChannel; // Queue the event for publishing

        this.trackEvent(event, callback);
      }
      /**
       * Adds an event to the queue
       * @param event
       * @param callback
       * @private
       */

    }, {
      key: "_push",
      value: function _push(event, callback) {
        this._queue.push({
          event: event,
          callback: callback
        }); // Save the queue


        this._saveQueue(true); // Start burning down the queue, unless the event says not to


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
      key: "_processQueue",
      value: function _processQueue() {
        var _this3 = this;

        // If the queue is not already being processed, and there's stuff to process, continue sending them
        if (!this._processTimeout && this._queue.length > 0) {
          this._processTimeout = setTimeout(function () {
            // Pull the items we're going to batch out of the queue
            var items = _this3._queue.splice(0, 255);

            _this3._saveQueue(false); // Track the item


            _this3._batchSend(items, function (err, res) {
              // TODO: If there was an error, consider splicing the batch back into the queue
              // Update / Set the metric sid on the publisher

              /* istanbul ignore else: server barks */
              if (res && res.data && res.data.sid) _this3._updateSid(res.data.sid); // When this batch is done being tracked, iterate to the next metric then fire it's callback if set

              _this3._processTimeout = null;

              _this3._processQueue(); // Fire the event callbacks if there are any


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
      key: "_batchSend",
      value: function _batchSend(items, callback) {
        var _this4 = this;

        // Normalize event data
        var events = items.map(function (item) {
          _this4._normalizeEvent(item.event); // Strip duplicated data from event batch


          delete item.event.sid;
          delete item.event.win;
          return item.event;
        });
        var payload = {
          events: events,
          win: okanjo.util.getLocation()
        };
        var route = okanjo.net.getRoute(okanjo.net.routes.metrics_batch); // Set sid if present

        if (this.sid) {
          payload.sid = this.sid;
        } // Send it


        okanjo.net.request.post(route, payload, function (err, res) {
          /* istanbul ignore if: out of scope */
          if (err) {
            okanjo.report('Failed to send metrics batch', {
              err: err,
              res: res,
              items: items,
              route: route
            });
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
      key: "_normalizeEvent",
      value: function _normalizeEvent(event) {
        // Ensure meta is ready to receive values
        event.m = event.m || {}; // Set key

        event.key = event.key || event.m.key || okanjo.key || undefined; // Set session

        if (this.sid) event.sid = this.sid; // Clone the metadata, since it might be a direct reference to a widget property
        // Deleting properties on the meta object, could be very destructive

        event.m = Object.assign({}, event.m); // event.m should be flat
        // Strip meta keys that should be excluded
        // Object.keys(Metrics.Meta.exclude).forEach((key) => delete event.m[key]);
        // ^ this is now done after flattening as an include-only model in v3.x+
        // Set referral channel / context

        if (this.sourceCh) {
          event.m.ref_ch = this.sourceCh;
        }

        if (this.sourceCx) {
          event.m.ref_cx = this.sourceCx;
        } // Set page group id


        event.m.pgid = this.pageId; // Set okanjo version

        event.m.ok_ver = okanjo.version; // Finalize metadata

        event.m = okanjo.util.flatten(event.m, {
          arrayToCsv: true
        }); // Only send allowed meta keys - rest will get stripped

        var allowedKeys = new Set(Metrics.Meta.include);
        Object.keys(event.m).forEach(function (key) {
          if (!allowedKeys.has(key)) delete event.m[key];
        }); // Ensure metadata strings won't exceed the imposed limit

        Object.keys(event.m).forEach(function (key) {
          if (typeof event.m[key] === "string") {
            event.m[key] = event.m[key].substr(0, 255);
          }
        }); // Set page source reference

        /* istanbul ignore else: jsdom setup with referrer */

        if (document.referrer) {
          event.ref = document.referrer;
        } // Set the window location


        event.win = okanjo.util.getLocation();
      }
      /**
       * Updates the stored session identifier
       * @param sid
       * @private
       */

    }, {
      key: "_updateSid",
      value: function _updateSid(sid) {
        // Not set or changed?
        if (sid && (!this.sid || this.sid !== sid)) {
          this.sid = sid;
          window.localStorage[Metrics.Params.name] = sid;
          okanjo.util.cookie.set(Metrics.Params.name, sid, Metrics.Params.ttl);
        }
      } //noinspection JSUnusedGlobalSymbols

      /**
       * Adds DOM element dimensions / positional data to the event
       * @param element
       * @param event
       * @return {*|{}}
       */

    }, {
      key: "create",
      value: //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols

      /**
       * Helper to create a new fluent event structure
       * @param args
       * @return {*}
       */
      function create() {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        return Metrics.create.apply(null, args);
      }
    }], [{
      key: "addElementInfo",
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
    }, {
      key: "addWidgetInfo",
      value: function addWidgetInfo(element, event) {
        var containerSize = okanjo.ui.getElementPosition(element);
        event = event || {};
        event.m = event.m || {}; // placement div size

        event.m.wox1 = containerSize.x1;
        event.m.woy1 = containerSize.y1;
        event.m.wox2 = containerSize.x2;
        event.m.woy2 = containerSize.y2; // Inner size is the min/max of the child elements since they may be floating and have no official height/width

        var resources = okanjo.qwery('.okanjo-resource, .okanjo-adx-container', element);
        var size,
            wix1,
            wiy1,
            wix2,
            wiy2,
            boxes = [];

        var getMin = function getMin(val, current) {
          return typeof current === "undefined" || val < current ? val : current;
        };

        var getMax = function getMax(val, current) {
          return typeof current === "undefined" || val > current ? val : current;
        };

        var fallback = function fallback(val, _fallback) {
          return typeof val === "undefined" ? _fallback : val;
        };

        resources.forEach(function (e) {
          size = okanjo.ui.getElementPosition(e);
          wix1 = getMin(size.x1, wix1);
          wiy1 = getMin(size.y1, wiy1);
          wix2 = getMax(size.x2, wix2);
          wiy2 = getMax(size.y2, wiy2);
          boxes.push(size.x1, size.y1, size.x2, size.y2);
        }); // inner size (might be centered or something)
        // noinspection JSUnusedAssignment

        event.m.wix1 = fallback(wix1, containerSize.x1); // noinspection JSUnusedAssignment

        event.m.wiy1 = fallback(wiy1, containerSize.y1); // noinspection JSUnusedAssignment

        event.m.wix2 = fallback(wix2, containerSize.x2); // noinspection JSUnusedAssignment

        event.m.wiy2 = fallback(wiy2, containerSize.y2);
        event.m.wrps = boxes.map(function (v) {
          return Math.floor(v);
        }).join(','); // all resource positions x1,y1,x2,y2,...

        return event;
      } //noinspection JSUnusedGlobalSymbols

      /**
       * Adds viewport dimensions / positional data to the event
       * @param event
       * @return {*|{}}
       */

    }, {
      key: "addViewportInfo",
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
      } //noinspection JSUnusedGlobalSymbols

      /**
       * Adds DOM event positional data to the event
       * @param jsEvent
       * @param event
       * @return {*|{}}
       */

    }, {
      key: "addEventInfo",
      value: function addEventInfo(jsEvent, event) {
        var pos = okanjo.ui.getEventPosition(jsEvent);
        event = event || {};
        event.m = event.m || {};
        event.m.et = pos.et;
        event.m.ex = pos.ex;
        event.m.ey = pos.ey;
        return event;
      } //noinspection JSUnusedGlobalSymbols

      /**
       * Adds meta data values to the event
       * @param event
       * @param args
       * @return {*|{}}
       */

    }, {
      key: "addEventMeta",
      value: function addEventMeta(event) {
        event = event || {};
        event.m = event.m || {};

        for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
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
      key: "create",
      value: function create(data) {
        for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
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
   * @type {{exclude: [*], include: [*]}}
   */

  Metrics.Meta = {
    exclude: ['key', 'callback', 'metrics_channel_context', 'metrics_context', 'mode'],
    include: ['decl', 'ex', 'ey', 'filters_sort_by', 'filters_sort_direction', 'filters_take', 'filters_type', 'filters_url', 'ok_ver', 'ph', 'pw', 'pten', 'ptid', 'res_bf', 'res_length', 'res_sf', 'res_spltfl', 'res_type', 'bf', 'sf', 'spltfl_seg', 'vx1', 'vx2', 'vy1', 'vy2', 'pgid', 'wgid', 'wix1', 'wix2', 'wiy1', 'wiy2', 'wox1', 'wox2', 'woy1', 'woy2', 'wrps', 'x1', 'x2', 'y1', 'y2', 'cid', 'campaign_id', 'expandable', 'res_total']
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

  var MetricEvent = /*#__PURE__*/function () {
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
      key: "data",
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
      key: "event",
      value: function event(jsEvent) {
        Metrics.addEventInfo(jsEvent, this);
        return this;
      }
      /**
       * Adds viewport dimensions / positional data to the event
       * @return {MetricEvent}
       */

    }, {
      key: "viewport",
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
      key: "element",
      value: function element(_element) {
        Metrics.addElementInfo(_element, this);
        return this;
      }
      /**
       * Adds widget DOM element dimensions / positional data to the event
       * @param element
       * @returns {MetricEvent}
       */

    }, {
      key: "widget",
      value: function widget(element) {
        Metrics.addWidgetInfo(element, this);
        return this;
      } //noinspection JSUnusedGlobalSymbols

      /**
       * Adds meta data values to the event
       * @param args
       * @return {MetricEvent}
       */

    }, {
      key: "meta",
      value: function meta() {
        for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
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
      key: "type",
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
      key: "send",
      value: function send(callback) {
        okanjo.metrics.trackEvent(this, callback); // DONT RETURN - BREAK THE CHAIN HERE
      }
      /**
       * Gets the single-metric tracking url for this event
       * @return {string}
       */

    }, {
      key: "toUrl",
      value: function toUrl() {
        // Copy data w/o modifying it
        var event = Object.assign({}, this); // Extract params

        var object_type = event.object_type,
            event_type = event.event_type;
        delete event.object_type;
        delete event.event_type; // Normalize event data

        okanjo.metrics._normalizeEvent(event); // Get the URL


        return okanjo.net.getRoute(okanjo.net.routes.metrics, {
          object_type: object_type,
          event_type: event_type
        }) + '?' + okanjo.net.request.stringify(event);
      }
    }]);

    return MetricEvent;
  }(); // Export / initialize


  okanjo.metrics = new Metrics();
})(window, document); //noinspection ThisExpressionReferencesGlobalObjectJS


(function (window) {
  var okanjo = window.okanjo; // Track the page view, but don't send it right away.
  // Send it in one full second unless something else pushes an event
  // This way, we have a chance that a placement key will be set globally

  okanjo.metrics.trackPageView({
    _noProcess: true
  });
  setTimeout(function () {
    okanjo.metrics._processQueue();
  }, 1000);
})(window); //noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols

/** Based on https://gist.github.com/mudge/5830382 **/


(function (window) {
  /**
   * Simplified EventEmitter base class
   */
  var EventEmitter = /*#__PURE__*/function () {
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
      key: "on",
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
      key: "removeListener",
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
      key: "emit",
      value: function emit(event) {
        var i,
            listeners,
            length,
            args = [].slice.call(arguments, 1);

        if (this._events[event]) {
          listeners = this._events[event].slice();
          length = listeners.length;

          for (i = 0; i < length; i++) {
            listeners[i].apply(this, args);
          }
        }
      } //noinspection JSUnusedGlobalSymbols

      /**
       * Registers an event handler to fire only once on an event
       * @param event
       * @param listener
       */

    }, {
      key: "once",
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
})(window); //noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols


(function (window) {
  var okanjo = window.okanjo;
  var DATA_ATTRIBUTE_PATTERN = /^data-(.+)$/;
  var DATA_REPLACE_PATTERN = /-/g;
  /**
   * Base widget class
   */

  var Widget = /*#__PURE__*/function (_okanjo$_EventEmitter) {
    _inherits(Widget, _okanjo$_EventEmitter);

    var _super = _createSuper(Widget);

    function Widget(element, options) {
      var _this7;

      _classCallCheck(this, Widget);

      _this7 = _super.call(this); // Verify element was given (we can't load unless we have one)

      if (!element || typeof element.nodeType === "undefined") {
        okanjo.report('Invalid or missing element on widget construction', {
          widget: _assertThisInitialized(_this7),
          element: element,
          options: options
        });
        throw new Error('Okanjo: Invalid element - make sure to pass a valid DOM element when constructing Okanjo Widgets.');
      } // Verify configuration is OK


      if (options && _typeof(options) !== "object") {
        // Warn and fix it
        okanjo.report('Invalid widget options. Expected object, got: ' + _typeof(options), {
          widget: _assertThisInitialized(_this7),
          element: element,
          options: options
        });
        options = {};
      } else {
        options = options || {};
      } // Store basics


      _this7.name = 'Widget';
      _this7.element = element;
      _this7.instanceId = okanjo.util.shortid(); // Clone initial config, breaking the top-level reference

      _this7.config = Object.assign({}, options);
      return _this7;
    }
    /**
     * Base widget initialization procedures
     */


    _createClass(Widget, [{
      key: "init",
      value: function init() {
        // process config attributes
        this._applyConfiguration();

        this._setCompatibilityOptions(); // ensure placement key


        if (!this._ensurePlacementKey()) return; // Tell the widget to load

        this.load();
      }
      /**
       * This is for extended widgets, so they may modify the configuration before loading
       */

    }, {
      key: "_setCompatibilityOptions",
      value: function _setCompatibilityOptions() {// By default, this does nothing. Must be overridden to be useful
      } //noinspection JSMethodCanBeStatic

      /**
       * Widget configuration definitions
       * @return {{}}
       */

    }, {
      key: "getSettings",
      value: function getSettings() {
        // Override this
        return {};
      }
      /**
       * Main widget load function.
       */

    }, {
      key: "load",
      value: function load() {// Override this in the widget implementation
      }
      /**
       * Applies data attribute settings and defaults to the widget configuration
       * @private
       */

    }, {
      key: "_applyConfiguration",
      value: function _applyConfiguration() {
        var _this8 = this;

        // this.config was set to the options provided in the constructor
        // so layer data attributes on top
        var data = this.getDataAttributes();
        var settings = this.getSettings();
        Object.keys(data).forEach(function (key) {
          var normalizedKey = key.replace(DATA_REPLACE_PATTERN, '_');
          var val = data[key]; // Attempt to convert the value if there's a setting for it

          if (settings[normalizedKey]) val = settings[normalizedKey].value(val, false);

          if (!okanjo.util.isEmpty(val)) {
            _this8.config[normalizedKey] = val;
          }
        }); // Apply defaults from the widget settings

        Object.keys(settings).forEach(function (key) {
          if (_this8.config[key] === undefined && settings[key]._default !== undefined) {
            _this8.config[key] = settings[key].value(undefined, false);
          }
        });
      } //noinspection JSUnusedGlobalSymbols

      /**
       * Gets a copy of the configuration, suitable for transmission
       * @return {{}}
       */

    }, {
      key: "getConfig",
      value: function getConfig() {
        var _this9 = this;

        var settings = this.getSettings();
        var out = {};
        Object.keys(this.config).forEach(function (origKey) {
          var val = _this9.config[origKey];
          var key = origKey;
          var group = null; // Check if this is a known property

          if (settings[key]) {
            val = settings[key].value(val);
            group = settings[key].getGroup();
          } // Init the target/group if not already setup


          var target = out;

          if (group) {
            target[group] = target[group] || {};
            target = target[group];
          } // Set the value on the target if set


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
      key: "_ensurePlacementKey",
      value: function _ensurePlacementKey() {
        // Check if set on widget or globally
        if (this.config.key) {
          return true;
        } else if (okanjo.key) {
          // Copy key from global scope,
          this.config.key = okanjo.key;
          return true;
        } // No key set, can't load.


        okanjo.report('No key provided on widget', {
          widget: this
        });
        this.showError('Error: Missing placement key.');
        return false;
      }
      /**
       * Displays an error in the widget element
       * @param message
       */

    }, {
      key: "showError",
      value: function showError(message) {
        this.setMarkup(okanjo.ui.engine.render('okanjo.error', this, {
          message: message
        }));
      }
      /**
       * Replaces the markup of the widget's element
       * @param markup
       */

    }, {
      key: "setMarkup",
      value: function setMarkup(markup) {
        this.element.innerHTML = markup;
        this.setFlexClasses(); // implicitly set the classes
      }
      /**
       * Sets the flex classes for the placement container element
       */

    }, {
      key: "setFlexClasses",
      value: function setFlexClasses() {
        var align = this.config.align;
        var justify = this.config.justify;
        if (align) this.element.classList.add('okanjo-align-' + align);
        if (justify) this.element.classList.add('okanjo-justify-' + justify);
      } //noinspection JSUnusedGlobalSymbols

      /**
       * Gets the current page URL, sans query string and fragment.
       * @returns {string} - URL
       */

    }, {
      key: "getDataAttributes",
      value:
      /**
       * Instead of using HTML5 dataset, just rip through attributes and return data attributes
       * @returns {*}
       */
      function getDataAttributes() {
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
      key: "getCurrentPageUrl",
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


  Widget.Field = /*#__PURE__*/function () {
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
      key: "array",
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
      } //noinspection JSUnusedGlobalSymbols

    }, {
      key: "string",
      value:
      /**
       * Formats the value as a string
       * @return {Field}
       */
      function string() {
        this._convert = function (val) {
          if (val === null || val === undefined) return val;else return "" + val;
        };

        return this;
      }
    }, {
      key: "bool",
      value:
      /**
       * Formats the value as a boolean (takes 1, 0, true, false)
       * @return {Field}
       */
      function bool() {
        this._convert = function (val) {
          if (typeof val === "string") {
            return val === "1" || val.toLowerCase() === "true";
          } else {
            return !!val;
          }
        };

        return this;
      } //noinspection JSUnusedGlobalSymbols

    }, {
      key: "strip",
      value:
      /**
       * Indicates the field should not be passed on for transmission
       * @return {Field}
       */
      function strip() {
        this._strip = true;
        return this;
      }
    }, {
      key: "int",
      value:
      /**
       * Formats the value as a integer (whole) number
       * @return {Field}
       */
      function int() {
        this._convert = function (val) {
          return parseInt(val);
        };

        return this;
      } //noinspection JSUnusedGlobalSymbols

    }, {
      key: "float",
      value:
      /**
       * Formats the value as a floating point number
       * @return {Field}
       */
      function float() {
        this._convert = function (val) {
          return parseFloat(val);
        };

        return this;
      } //noinspection JSUnusedGlobalSymbols

    }, {
      key: "default",
      value: //noinspection ReservedWordAsName

      /**
       * Sets the default value to use if not set
       * @param val
       * @return {Field}
       */
      function _default(val) {
        this._default = val;
        return this;
      }
      /**
       * Assigns the property to a bucket for hierarchy
       * @param name
       * @return {Field}
       */

    }, {
      key: "group",
      value: function group(name) {
        this._group = name;
        return this;
      }
      /**
       * Gets the group the field belongs to
       * @return {*|null}
       */

    }, {
      key: "getGroup",
      value: function getGroup() {
        return this._group;
      } //noinspection JSUnusedGlobalSymbols

      /**
       * Gets the formatted value of the field
       * @param val
       * @param strip
       * @return {*}
       */

    }, {
      key: "value",
      value: function value(val) {
        var strip = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        if (this._strip && strip) return undefined;

        if (val !== undefined && this._convert) {
          val = this._convert(val);
        }

        return val !== undefined ? val : this._default;
      }
    }], [{
      key: "array",
      value: function array(converter) {
        return new Field().array(converter);
      }
    }, {
      key: "string",
      value: function string() {
        return new Field().string();
      }
    }, {
      key: "bool",
      value: function bool() {
        return new Field().bool();
      }
    }, {
      key: "strip",
      value: function strip() {
        return new Field().strip();
      }
    }, {
      key: "int",
      value: function int() {
        return new Field()["int"]();
      }
    }, {
      key: "float",
      value: function float() {
        return new Field()["float"]();
      }
    }]);

    return Field;
  }(); // Export


  return okanjo._Widget = Widget;
})(window); //noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols


(function (window) {
  //region Imports and Constants
  var okanjo = window.okanjo;
  var _okanjo$_Widget$Field = okanjo._Widget.Field,
      string = _okanjo$_Widget$Field.string,
      array = _okanjo$_Widget$Field.array,
      _float = _okanjo$_Widget$Field["float"],
      _int = _okanjo$_Widget$Field["int"],
      bool = _okanjo$_Widget$Field.bool;
  var Metrics = okanjo.metrics.constructor;
  var TemplateEngine = okanjo.ui.engine.constructor;
  var FILTERS = 'filters';
  var DISPLAY = 'display';
  var ARTICLE_META = 'article_meta';
  var MINIMUM_VIEW_PX = 0.5; // 50% of pixels must be in viewport

  var MINIMUM_VIEW_TIME = 1000; // for 1 full second

  var MINIMUM_VIEW_FREQ = 2; // time / freq = interval

  var LARGE_PX_THRESHOLD = 242000; // For large ads, a reduced % is applied

  var LARGE_MINIMUM_VIEW_PX = 0.3; // 30% of pixels must be in viewport for large ads
  //endregion

  /**
   * Placement widget
   */

  var Placement = /*#__PURE__*/function (_okanjo$_Widget) {
    _inherits(Placement, _okanjo$_Widget);

    var _super2 = _createSuper(Placement);

    //region Configuration & Overrides

    /**
     * Initializes a new placement
     * @param element
     * @param options
     */
    function Placement(element) {
      var _this10;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Placement);

      // Flatten the options before passing on
      options = okanjo.util.flatten(options, {
        ignoreArrays: true
      });
      _this10 = _super2.call(this, element, options);
      _this10.name = 'Placement';
      _this10._metricBase = {}; // placeholder for metrics

      _this10._response = null; // placeholder for api response
      // Aggregate view watchers into a single interval fn

      _this10._viewWatcherIv = null;
      _this10._viewedWatchers = []; // Start loading content

      if (!options.no_init) _this10.init();
      return _this10;
    } //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols

    /**
     * Gets the widget settings configuration
     * @return {{type: *, ids: *, q: *, url: *, url_referrer: *, url_selectors: *, organization_id: *, property_id: *, store_id: *, organization_name: *, property_name: *, store_name: *, external_id: *, sku: *, external_store_id: *, condition: *, manufacturer: *, upc: *, isbn: *, tags: *, category: *, pools: *, min_price: *, max_price: *, min_donation_percent: *, max_donation_percent: *, donation_to: *, sort_by: *, sort_direction: *, skip: *, take: *, placement_tests_only: *, size: *, template_name: *, template_layout: *, template_theme: *, template_cta_style: *, template_cta_text: *, template_cta_color: *, adx_unit_path: *, url_category: *, url_keywords: *, no_init: *, proxy_url: *, expandable, disable_inline_buy, disable_popup, backwards: *}}
     */


    _createClass(Placement, [{
      key: "getSettings",
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
          url_paths: array().group(FILTERS),
          not_url_paths: array().group(FILTERS),
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
          min_price: _float().group(FILTERS),
          max_price: _float().group(FILTERS),
          // Filter by donation ranges
          min_donation_percent: _float().group(FILTERS),
          max_donation_percent: _float().group(FILTERS),
          // Filter by donation recipient
          donation_to: string().group(FILTERS),
          // Sorting
          sort_by: string().group(FILTERS),
          sort_direction: string().group(FILTERS),
          // Pagination
          skip: _int().group(FILTERS),
          take: _int().group(FILTERS),
          // Placement Testing
          placement_tests_only: bool(),
          // Display settings
          size: string().group(DISPLAY),
          template_name: string().group(DISPLAY),
          template_layout: string().group(DISPLAY),
          template_theme: string().group(DISPLAY),
          template_variant: string().group(DISPLAY),
          template_cta_style: string().group(DISPLAY),
          template_cta_text: string().group(DISPLAY),
          template_cta_color: string().group(DISPLAY),
          template_cta_invert: bool().group(DISPLAY),
          // Whether to invert the cta color scheme
          adx_unit_path: string().group(DISPLAY),
          // Custom DFP ad unit path
          hide_pricing: bool().group(DISPLAY),
          // hide price container on product resources
          // Flexbox
          align: string().group(DISPLAY),
          justify: string().group(DISPLAY),
          // Custom CSS
          custom_css_url: string().group(DISPLAY),
          custom_css: string().group(DISPLAY),
          // Article metadata
          url_category: array().group(ARTICLE_META),
          url_keywords: array().group(ARTICLE_META),
          // Functional settings
          key: string().strip(),
          // don't need to resend key on all our requests
          no_init: bool().strip(),
          // don't automatically load the placement, do it manually (e.g. (new Placement({no_init:true})).init()
          no_css: bool().strip(),
          // don't automatically include stylesheets
          verbose_click_data: bool().strip()["default"](false),
          // when enabled, sends ok_msid, ok_ch, ok_cx, _okjr to the destination url
          utm_click_data: bool().strip()["default"](false),
          // when enabled, sends url_source, utm_campaign, and utm_medium to the destination url
          proxy_url: string().strip(),
          expandable: bool().strip()["default"](true),
          disable_inline_buy: bool().strip()["default"](false),
          // stops inline buy functionality
          disable_popup: bool().strip()["default"](false),
          // stops new window on mobile for inline buy functionality
          backwards: string().strip(),
          // internal flag indicating port from a deprecated widget
          testing: bool().strip() // metrics flag to indicate testing

        };
      }
      /**
       * Gets the widget configuration formatted using settings, suitable for transmission
       * @return {{filters: {}, display: {}, backfill: {}, shortfill: {}, article_meta: {}}}
       */

    }, {
      key: "getConfig",
      value: function getConfig() {
        var _this11 = this;

        var settings = this.getSettings();
        var out = {
          filters: {},
          display: {},
          backfill: {},
          shortfill: {},
          article_meta: {}
        };
        var backfillPattern = /^backfill_(.+)$/; // backfill_property

        var shortfillPattern = /^shortfill_(.+)$/; // shortfill_property

        Object.keys(this.config).forEach(function (origKey) {
          var val = _this11.config[origKey];
          var key = origKey;
          var isBackfill = false;
          var isShortfill = false;
          var group = null; // Get the property name if it was prefixed with backfill

          var matches = backfillPattern.exec(origKey);

          if (matches) {
            key = matches[1];
            isBackfill = true;
          } else {
            // Get the property name if it was prefixed with shortfill
            matches = shortfillPattern.exec(origKey);

            if (matches) {
              key = matches[1];
              isShortfill = true;
            }
          } // Check if this is a known property


          if (settings[key]) {
            val = settings[key].value(val);
            group = settings[key].getGroup();
          } // Init the target/group if not already setup


          var target = out;

          if (isBackfill) {
            target = out.backfill;
          } else if (isShortfill) {
            target = out.shortfill;
          } // Set the target to the bucket in the settings container
          // except shortfill - can only apply settings directly to the bucket
          // e.g. backfill_url -> { backfill: { filters: { url: xxx } } }
          // e.g. shortfill_url-> { shortfill: { url: xxx } }


          if (!isShortfill && group) {
            target[group] = target[group] || {};
            target = target[group];
          } // Set the value on the target if set


          if (val === null) {
            target[key] = ''; // format null values as empty strings for transmission
          } else if (val !== undefined) {
            target[key] = val;
          }
        });
        return out;
      } //noinspection JSUnusedGlobalSymbols

      /**
       * Core load process
       */

    }, {
      key: "load",
      value: function load() {
        var _this12 = this;

        // Set metric base data (stub for all future events emitted by the widget)
        this._setMetricBase(); // Find out what we should display here


        this._fetchContent(function (err) {
          if (err) {
            // Report the widget load as declined
            _this12._reportWidgetLoad("fetch failed: " + err.statusCode ||
            /* istanbul ignore next: out of scope */
            err.toString());
          } else {
            // Merge display settings from response
            _this12._mergeResponseSettings(); // Merge the referential data from the response


            _this12._updateBaseMetaFromResponse(); // Handle rendering based on output type


            _this12._showContent();
          }
        });
      } //endregion
      //region Internal Helpers

      /**
       * Initializes the common metric data for events emitted by the placement
       * @private
       */

    }, {
      key: "_setMetricBase",
      value: function _setMetricBase() {
        var base = this._metricBase;
        base.ch = Metrics.Channel.placement;
        base.cx = this.config.backwards || 'auto';
        base.key = this.config.key;
        base.m = base.m || {};
        base.m.wgid = this.instanceId;
        if (this.config.testing) base.env = Metrics.Environment.testing;
      }
      /**
       * Emits the widget impression event
       * @param declined
       * @private
       */

    }, {
      key: "_reportWidgetLoad",
      value: function _reportWidgetLoad(declined) {
        var _this13 = this;

        var segments = this._getResponseData(); // widget stats now aggregate all segments


        var backfilled = segments.find(function (s) {
          return s.backfilled;
        }) ? 1 : 0,
            shortfilled = segments.find(function (s) {
          return s.shortfilled;
        }) ? 1 : 0,
            splitfilled = segments.length > 1 ? 1 : 0,
            res_total = segments.reduce(function (a, c) {
          return a + (c.total || 0);
        }, 0),
            res_length = segments.reduce(function (a, c) {
          return a + (c.results && c.results.length || 0);
        }, 0),
            res_types = Array.from(new Set(segments.map(function (s) {
          return s.type;
        }))); // If this is declined, mark future events as declined too

        this._metricBase.m.decl = declined || '0'; // Attach other main response attributes to all future events

        this._metricBase.m.res_bf = backfilled; // whether the response used the backfill flow

        this._metricBase.m.res_sf = shortfilled; // whether the response used the shortfill flow

        this._metricBase.m.res_spltfl = splitfilled; // whether the response used the splitfill flow

        this._metricBase.m.res_total = res_total; // how many total candidate results were available given filters

        this._metricBase.m.res_type = res_types.length > 1 ? Placement.ContentTypes.mixed : res_types[0]; // what the given resource type was

        this._metricBase.m.res_length = res_length; // number of resources delivered
        // Track impression

        okanjo.metrics.create(this._metricBase).type(Metrics.Object.widget, Metrics.Event.impression).meta(this.getConfig()).element(this.element) // this might not be all that useful cuz the content hasn't been rendered yet
        .viewport().widget(this.element).send(); // Start watching for a viewable impression

        this._addOnceViewedHandler(this.element, function () {
          okanjo.metrics.create(_this13._metricBase).type(Metrics.Object.widget, Metrics.Event.view).meta(_this13.getConfig()).element(_this13.element).viewport().widget(_this13.element).send();
        });
      }
      /**
       * Executes the request for content to fill the placement
       * @param callback
       * @private
       */

    }, {
      key: "_fetchContent",
      value: function _fetchContent(callback) {
        var _this14 = this;

        // Build request to api, starting with this placement config params
        var query = this.getConfig(); // Extract the key

        var key = this.config.key; // Attach sid and referrer

        if (okanjo.metrics.sid) query.sid = okanjo.metrics.sid;
        query.filters.url_referrer = this.config.url_referrer || window.location.href;
        query.wgid = this.instanceId;
        query.pgid = okanjo.metrics.pageId; // Send it

        okanjo.net.request.post("".concat(okanjo.net.getRoute(okanjo.net.routes.ads, null, this.config.sandbox ? 'sandbox' : 'live'), "?key=").concat(encodeURIComponent(key)), query, function (err, res) {
          if (err) {
            okanjo.report('Failed to retrieve placement content', err, {
              placement: _this14
            });

            _this14.setMarkup(''); // Don't show anything


            _this14.emit('error', err);

            callback && callback(err);
          } else {
            // Store the raw response
            _this14._response = res; // Hook point for response handling

            _this14.emit('data'); // Return


            callback && callback();
          }
        });
      }
      /**
       * Extracts the response data from the payload (segments)
       * @returns {*[]}
       * @private
       */

    }, {
      key: "_getResponseData",
      value: function _getResponseData() {
        var res = this._response;
        return [].concat(res && res.data || [{}]); // will force the old response data into an array
      }
      /**
       * Applies response filters and display settings into the widget configuration
       * @private
       */

    }, {
      key: "_mergeResponseSettings",
      value: function _mergeResponseSettings() {
        var _this15 = this;

        // Apply the base segment settings as the main widget display settings
        var data = this._getResponseData()[0]; // Merge the base results


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
      key: "_updateBaseMetaFromResponse",
      value: function _updateBaseMetaFromResponse() {
        // Update the base metric data with info from the response
        // SmartServe can now return an array of result objects
        var data = this._getResponseData()[0] || {};
        this._metricBase.m = this._metricBase.m || {};
        var meta = this._metricBase.m; // Article

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
      key: "_showContent",
      value: function _showContent() {
        var segments = this._getResponseData(); // 1. Render each segment to list html, store in array
        // 2a. If array is empty, handle empty decline
        // 2b. If not empty, render container html passing contents to embed
        // 3. Set markup to final container render
        // 4. Do follow-up event binding and cleanup stuff
        // If there are multiple segments, force responsive slab template for now


        if (segments.length > 1) {
          this.config.template_name = 'slab';
          this.config.size = 'responsive';
        } // Assemble list contents


        var renderedSegments = [];

        for (var segment, i = 0; i < segments.length; i++) {
          segment = segments[i]; // Known content types we can display

          if (segment.type === Placement.ContentTypes.products) {
            renderedSegments.push(this._renderProductSegment(segment, i));
          } else if (segment.type === Placement.ContentTypes.articles) {
            renderedSegments.push(this._renderArticleSegment(segment, i));
          } else if (segment.type === Placement.ContentTypes.adx) {
            renderedSegments.push(this._renderADXSegment(segment, i));
          } else {
            // Unknown response type!
            // Report the widget load as declined
            var msg = 'Unknown response content type: ' + segment.type;
            okanjo.report(msg, {
              placement: this
            }); // this.setMarkup(''); // Don't show anything

            this.emit('error', msg); // this._reportWidgetLoad(msg);
          }
        } // Filter empty segments
        // console.log('rendered segs', renderedSegments)


        renderedSegments = renderedSegments.filter(function (html) {
          return !!html;
        }); // No segments? Decline

        if (renderedSegments.length === 0) {
          this.emit('empty');

          this._reportWidgetLoad('empty'); // decline the impression


          return;
        } // Render the container and insert the markup


        var model = this._getBaseRenderModel({
          segmentContent: renderedSegments.join('')
        });

        var templateName = this._getTemplate(Placement.ContentTypes.container, Placement.DefaultTemplates.container);

        this.setMarkup(okanjo.ui.engine.render(templateName, this, model)); // Report load

        this._reportWidgetLoad(); // Handle resource post-render events


        this._postProductRender();

        this._postArticleRender();

        this._postADXRender(); // Fit images


        okanjo.ui.fitImages(this.element); // Hook point that the widget is done loading

        this.emit('load');
      }
      /**
       * Returns the base render model with common properties set
       * @param model
       * @returns {{}}
       * @private
       */

    }, {
      key: "_getBaseRenderModel",
      value: function _getBaseRenderModel(model) {
        model.css = !this.config.no_css;
        model.button_classes = this.config.template_cta_invert ? 'invert' : '';
        model.price_classes = this.config.hide_pricing ? 'okanjo-invisible' : '';
        return model;
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
      key: "_getClickThroughURL",
      value: function _getClickThroughURL(event, url, additionalUrlParams) {
        var joiner = url.indexOf('?') >= 0 ? '&' : '?'; // Tack on transfer params

        additionalUrlParams = additionalUrlParams ||
        /* istanbul ignore next: paranoia */
        {};
        additionalUrlParams.ok_msid = okanjo.metrics.sid || 'unknown';

        if (this.config.verbose_click_data) {
          additionalUrlParams.ok_ch = this._metricBase.ch;
          additionalUrlParams.ok_cx = this._metricBase.cx;
          additionalUrlParams._okjr = btoa(window.location.href.split(/[?#]/)[0]); // mod_security by default 403's when urls are present as query args
        }

        if (this.config.utm_click_data) {
          additionalUrlParams.utm_source = 'okanjo';
          additionalUrlParams.utm_medium = 'smartserve'; // additionalUrlParams.utm_source = window.location.hostname;
          // additionalUrlParams.utm_campaign = 'smartserve';
        }

        url += joiner + Object.keys(additionalUrlParams).map(function (key) {
          return encodeURIComponent(key) + '=' + encodeURIComponent(additionalUrlParams[key]);
        }).join('&'); // Wrap the url if we're proxying

        if (this.config.proxy_url) {
          url = this.config.proxy_url + encodeURIComponent(url);
        } // Set the url on the event


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
      key: "_handleResourceMouseDown",
      value: function _handleResourceMouseDown(type, resource, e) {
        // Generate a new click id for this event
        // const clickId = okanjo.util.shortid();
        var clickId = resource._cid; // Start building the event

        var event = okanjo.metrics.create(this._metricBase, {
          id: resource.id
        }).type(type, Metrics.Event.interaction).meta(this.getConfig()).meta({
          cid: clickId
        }).meta({
          bf: resource.backfill ? 1 : 0,
          sf: resource.shortfill ? 1 : 0,
          spltfl_seg: okanjo.util.ifDefined(resource.splitfill_segment)
        }).event(e).element(e.currentTarget).viewport().widget(this.element); // Pull the proper params out of the resource depending on it's type

        var trackParam = 'url_track_param';
        var urlParam = 'url';

        if (type === Metrics.Object.product) {
          trackParam = 'buy_url_track_param';
          urlParam = 'buy_url';
        } // Attach the campaign tracking identifier


        var additionalParams = {
          ok_cid: clickId
        };
        if (resource[trackParam]) additionalParams[resource[trackParam]] = clickId; // Update the link with the event data

        event.data({
          ea: Metrics.Action.click
        });
        e.currentTarget.href = this._getClickThroughURL(event, resource[urlParam], additionalParams); // Cache this on the product

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
      key: "_getTemplate",
      value: function _getTemplate(contentType, defaultName) {
        var templateName = this.config.template_name;

        if (!templateName || !okanjo.ui.engine.isTemplateRegistered("".concat(contentType, ".").concat(templateName))) {
          templateName = defaultName;
        }

        return "".concat(contentType, ".").concat(templateName);
      }
      /**
       * Enforces size/layout/cta restrictions
       * @private
       */

    }, {
      key: "_enforceLayoutOptions",
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
       * Enforces
       * @private
       */

    }, {
      key: "_enforceSlabLayoutOptions",
      value: function _enforceSlabLayoutOptions() {
        if (this.config.size === "medium_rectangle" || this.config.size === "billboard") {
          // no list view
          this.config.template_layout = "grid"; // no buttons

          if (this.config.template_cta_style === "button") {
            this.config.template_cta_style = "link";
          }
        } else if (this.config.size === "half_page") {
          this.config.template_layout = "grid";
        } else if (this.config.size === "leaderboard" || this.config.size === "large_mobile_banner") {
          this.config.template_layout = "list"; // no button

          if (this.config.template_cta_style === "button") {
            this.config.template_cta_style = "link";
          }
        } else if (this.config.size === "auto") {
          this.config.template_layout = "list";
        } else if (this.config.size === "responsive") {
          // no button in responsive mode
          if (this.config.template_cta_style === "button") {
            this.config.template_cta_style = "link";
          }
        }
      }
      /**
       * Handles custom styling display settings
       * @private
       */

    }, {
      key: "_registerCustomBranding",
      value: function
        /*prefix, buttonClass*/
      _registerCustomBranding() {
        var brandColor = this.config.template_cta_color,
            brandCSSId = "okanjo-wgid-" + this.instanceId;
        var brandCSS = '';

        if (brandColor) {
          brandCSS = "\n                    .okanjo-block2.".concat(brandCSSId, " .okanjo-resource-cta-button, .okanjo-block2.").concat(brandCSSId, " .okanjo-resource-buy-button { color: ").concat(brandColor, " !important; }\n                    .okanjo-block2.").concat(brandCSSId, ".okanjo-cta-style-button .okanjo-resource-cta-button, .okanjo-block2.").concat(brandCSSId, ".okanjo-cta-style-button .okanjo-resource-buy-button { border-color: ").concat(brandColor, " !important; }\n                    .okanjo-block2.").concat(brandCSSId, ".okanjo-cta-style-button .okanjo-resource-cta-button:hover, .okanjo-block2.").concat(brandCSSId, ".okanjo-cta-style-button .okanjo-resource-buy-button:hover { background: ").concat(brandColor, " !important; color: #fff !important; }\n                    .okanjo-block2.").concat(brandCSSId, ".okanjo-cta-style-button .okanjo-resource-buy-button.invert, .okanjo-block2.").concat(brandCSSId, ".okanjo-cta-style-button .okanjo-resource-cta-button.invert { background: ").concat(brandColor, " !important; color: #fff !important; }\n                    .okanjo-block2.").concat(brandCSSId, ".okanjo-cta-style-button .okanjo-resource-buy-button.invert:hover, .okanjo-block2.").concat(brandCSSId, ".okanjo-cta-style-button .okanjo-resource-cta-button.invert:hover { background: #fff !important; color: ").concat(brandColor, " !important; }\n                ");
        } // Append custom inline css to the element


        if (this.config.custom_css) {
          brandCSS += '\n\n' + this.config.custom_css;
        } // Custom external stylesheet first (so inline styles can get priority)


        if (this.config.custom_css_url) {
          okanjo.ui.engine.ensureExternalCss(this.config.custom_css_url);
        } // Append the custom widget css to the dom


        if (brandCSS) {
          okanjo.ui.engine.registerCss(brandCSSId, brandCSS, {
            id: brandCSSId
          });
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
      key: "_addOnceViewedHandler",
      value: function _addOnceViewedHandler(element, handler) {
        var controller = {
          element: element,
          successfulCount: 0,
          handler: handler
        }; // Add our element to the watch list and turn on the watcher if not already on

        this._viewedWatchers.push(controller);

        this._toggleViewWatcher(true);
      }
      /**
       * Interval function to check viewability of registered elements
       * @private
       */

    }, {
      key: "_checkViewWatchers",
      value: function _checkViewWatchers() {
        // Check each registered watcher
        for (var i = 0, controller; i < this._viewedWatchers.length; i++) {
          controller = this._viewedWatchers[i];

          var _okanjo$ui$getPercent = okanjo.ui.getPercentageInViewport(controller.element),
              percentage = _okanjo$ui$getPercent.percentage,
              elementArea = _okanjo$ui$getPercent.elementArea; // Check if watcher is complete, then remove it from the list

          /* istanbul ignore next: jsdom won't trigger this */


          if (okanjo.ui.isElementVisible(controller.element) && percentage >= (elementArea >= LARGE_PX_THRESHOLD ? LARGE_MINIMUM_VIEW_PX : MINIMUM_VIEW_PX)) {
            controller.successfulCount++;
          } // While this could more optimally be contained within the former condition, unit-testing blocks on this


          if (controller.successfulCount >= MINIMUM_VIEW_FREQ) {
            controller.handler();

            this._viewedWatchers.splice(i, 1);

            i--;
          }
        } // Turn off if nobody is watching


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
      key: "_toggleViewWatcher",
      value: function _toggleViewWatcher(enabled) {
        if (enabled) {
          if (this._viewWatcherIv === null) {
            this._viewWatcherIv = setInterval(this._checkViewWatchers.bind(this), MINIMUM_VIEW_TIME / MINIMUM_VIEW_FREQ);
          }
        } else {
          clearInterval(this._viewWatcherIv);
          this._viewWatcherIv = null;
        }
      } //endregion
      //region Product Handling

      /**
       * Renders a product segment
       * @param data SmartServe segment data
       * @param segmentIndex Segment index number
       * @returns {string} Rendered segment HTML
       * @private
       */

    }, {
      key: "_renderProductSegment",
      value: function _renderProductSegment(data, segmentIndex) {
        var _this16 = this;

        // Determine template to render, using custom template name if it exists
        var templateName = this._getTemplate(Placement.ContentTypes.products, Placement.DefaultTemplates.products); // Format products


        data.results.forEach(function (offer, index) {
          // Disable inline buy if configured to do so
          if (_this16.config.disable_inline_buy) offer.inline_buy_url = null;
          if (offer.inline_buy_url) offer._escaped_inline_buy_url = encodeURIComponent(offer.inline_buy_url); // Set primary image

          offer._image_url = offer.image_urls ? offer.image_urls[0] : ''; // Escape buy url (fixme: does not include proxy_url!)

          offer._escaped_buy_url = encodeURIComponent(offer.buy_url); // Make price tag pretty

          offer._price_formatted = TemplateEngine.formatCurrency(offer.price);
          offer._index = index;
          offer.splitfill_segment = segmentIndex;
          offer._segmentIndex = segmentIndex;
        });

        var model = this._getBaseRenderModel({
          resources: data.results
        }); // Render and return html (will get concatenated later)


        return okanjo.ui.engine.render(templateName, this, model);
      }
      /**
       * Handles post-render events for product resources
       * @private
       */

    }, {
      key: "_postProductRender",
      value: function _postProductRender() {
        var _this17 = this;

        // Detect broken images
        this.element.querySelectorAll('.okanjo-product .okanjo-resource-image').forEach(function (img) {
          img.addEventListener('error', function () {
            img.src = okanjo.ui.inlineSVG(okanjo.ui.productSVG());
            console.error('[okanjo] Failed to load product image: ' + img.getAttribute('data-id')); // TODO: notify of resource failure
          });
        }); // Bind interaction handlers and track impressions

        var segments = this._getResponseData();

        this.element.querySelectorAll('.okanjo-product > a').forEach(function (a) {
          var id = a.getAttribute('data-id'),
              segment = parseInt(a.getAttribute('data-segment')),
              index = parseInt(a.getAttribute('data-index')); // Don't bind links that are not tile links

          /* istanbul ignore else: custom templates could break it */

          if (id && index >= 0 && segment >= 0) {
            var data = segments[segment];
            /* istanbul ignore if: custom templates could break it */

            if (!data) return;
            var product = data.results[index];
            /* istanbul ignore else: custom templates could break it */

            if (product) {
              // Bind interaction listener
              a.addEventListener('mousedown', _this17._handleResourceMouseDown.bind(_this17, Metrics.Object.product, product));
              a.addEventListener('click', _this17._handleProductClick.bind(_this17, product)); // Track impression

              okanjo.metrics.create(_this17._metricBase, {
                id: product.id
              }).type(Metrics.Object.product, Metrics.Event.impression).meta(_this17.getConfig()).meta({
                bf: product.backfill ? 1 : 0,
                sf: product.shortfill ? 1 : 0,
                spltfl_seg: okanjo.util.ifDefined(product.splitfill_segment)
              }).element(a).viewport().widget(_this17.element).send(); // Start watching for a viewable impression

              _this17._addOnceViewedHandler(a, function () {
                okanjo.metrics.create(_this17._metricBase, {
                  id: product.id
                }).type(Metrics.Object.product, Metrics.Event.view).meta(_this17.getConfig()).meta({
                  bf: product.backfill ? 1 : 0,
                  sf: product.shortfill ? 1 : 0,
                  spltfl_seg: okanjo.util.ifDefined(product.splitfill_segment)
                }).element(a).viewport().widget(_this17.element).send();
              });
            }
          }
        }); // Truncate product name to fit the space

        this.element.querySelectorAll('.okanjo-product .okanjo-resource-title').forEach(function (element) {
          okanjo.ui.ellipsify(element);
        });
      }
      /**
       * Handles the product click process
       * @param product
       * @param e
       * @private
       */

    }, {
      key: "_handleProductClick",
      value: function _handleProductClick(product, e) {
        // Update the event
        if (!product._event || !product._additionalParams || !product._clickId) {
          this._handleResourceMouseDown(Metrics.Object.product, product, e);
        } // Extract the already generated event and params list


        var event = product._event,
            additionalParams = product._additionalParams; // Update the event to the current one

        event.event(e); // Determine what we're doing - native ux or redirect

        var showNativeBuyUx = !!product.inline_buy_url,
            showPopupNativeBuyUx = !this.config.disable_popup && showNativeBuyUx && okanjo.util.isMobile(); // Show the inline buy experience or redirect

        if (showPopupNativeBuyUx) {
          // Mobile native buy ux
          // Don't follow the link
          e.preventDefault(); //
          // Mobile devices (especially iOS) have real janky UX when interacting with iframes.
          // So, we'll choose to popup a window with the native buy experience, so we can ensure
          // a positive user experience. Nobody likes bouncy form fields and really weird zooming.
          //
          // Update the event

          event.data({
            ea: Metrics.Action.inline_click
          }).meta({
            popup: 'true'
          }); // Get the frame url

          var url = this._getClickThroughURL(event, product.inline_buy_url, additionalParams); // Open the window or redirect if that failed


          this._popupFrame = window.open(url, "okanjo-inline-buy-frame", "width=400,height=400,location=yes,resizable=yes,scrollbars=yes");
          /* istanbul ignore else: jsdom doesn't support window.open or setting window.location.href */

          if (!this._popupFrame) {
            // Fallback to just replacing the window with the target, since popups don't work :(
            okanjo.report('Popup blocker stopped buy experience from showing', {
              placement: this
            });
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
          }; // Apply attributes

          Object.keys(attributes).forEach(function (key) {
            return frame.setAttribute(key, attributes[key]);
          }); // Check whether we're allowed to expand past the bounds of the placement

          additionalParams.ok_expandable = this.config.expandable ? 1 : 0;

          if (!this.config.expandable) {
            var parent = this.element.querySelector('.okanjo-expansion-root');
            /* istanbul ignore else: custom templates could break this */

            if (parent) {
              frame.className += ' okanjo-ad-in-unit';
              frame.setAttribute('height', "100%");
              frame.setAttribute('width', "100%");
              parent.appendChild(frame);
              var size = okanjo.ui.getElementSize(parent);
              additionalParams.ok_frame_height = size.height;
              additionalParams.ok_frame_width = size.width;
              /* istanbul ignore next: i'm not writing a whole test for this one config param */

              if (this.config.size) additionalParams.ok_ad_size = this.config.size;
            }
          } // Update the event


          event.data({
            ea: Metrics.Action.inline_click
          }).meta({
            expandable: this.config.expandable ? 'true' : 'false'
          }); // Set the frame url

          frame.src = this._getClickThroughURL(event, product.inline_buy_url, additionalParams); // Show the modal if it was not internally expanded

          if (!frame.parentNode) {
            okanjo.ui.modal.show(frame);
          }
        } else {
          // Update the link a second time, just in case the data changed
          e.currentTarget.href = this._getClickThroughURL(event, product.buy_url, additionalParams);
        }
      } //endregion
      //region Article Handling

      /**
       * Renders an article segment
       * @param data SmartServe segment data
       * @param segmentIndex Segment index number
       * @returns {string} Rendered segment HTML
       * @private
       */

    }, {
      key: "_renderArticleSegment",
      value: function _renderArticleSegment(data, segmentIndex) {
        // Determine template to render, using custom template name if it exists
        var templateName = this._getTemplate(Placement.ContentTypes.articles, Placement.DefaultTemplates.articles); // - render
        // Format articles


        data.results.forEach(function (article, index) {
          // Escape url (fixme: does not include proxy_url!)
          article._escaped_url = encodeURIComponent(article.url);
          article._index = index;
          article.splitfill_segment = segmentIndex;
          article._segmentIndex = segmentIndex;
        });

        var model = this._getBaseRenderModel({
          resources: data.results
        }); // Render and return html (will get concatenated later)


        return okanjo.ui.engine.render(templateName, this, model);
      }
      /**
       * Handles post-render events for article resources
       * @private
       */

    }, {
      key: "_postArticleRender",
      value: function _postArticleRender() {
        var _this18 = this;

        // Detect broken images
        this.element.querySelectorAll('.okanjo-article .okanjo-resource-image').forEach(function (img) {
          img.addEventListener('error', function () {
            img.src = okanjo.ui.inlineSVG(okanjo.ui.articleSVG());
            console.error('[okanjo] Failed to load article image: ' + img.getAttribute('data-id')); // TODO: notify of resource failure
          });
        }); // Bind interaction handlers and track impressions

        var segments = this._getResponseData();

        this.element.querySelectorAll('.okanjo-article > a').forEach(function (a) {
          var id = a.getAttribute('data-id'),
              segment = parseInt(a.getAttribute('data-segment')),
              index = parseInt(a.getAttribute('data-index')); // Don't bind links that are not tile links

          /* istanbul ignore else: custom templates could break this */

          if (id && index >= 0 && segment >= 0) {
            var data = segments[segment];
            /* istanbul ignore if: custom templates could break it */

            if (!data) return;
            var article = data.results[index];
            /* istanbul ignore else: custom templates could break this */

            if (article) {
              // Bind interaction listener
              a.addEventListener('mousedown', _this18._handleResourceMouseDown.bind(_this18, Metrics.Object.article, article));
              a.addEventListener('click', _this18._handleArticleClick.bind(_this18, article)); // Track impression

              okanjo.metrics.create(_this18._metricBase, {
                id: article.id
              }).type(Metrics.Object.article, Metrics.Event.impression).meta(_this18.getConfig()).meta({
                bf: article.backfill ? 1 : 0,
                sf: article.shortfill ? 1 : 0,
                spltfl_seg: okanjo.util.ifDefined(article.splitfill_segment)
              }).element(a).viewport().widget(_this18.element).send(); // Start watching for a viewable impression

              _this18._addOnceViewedHandler(a, function () {
                okanjo.metrics.create(_this18._metricBase, {
                  id: article.id
                }).type(Metrics.Object.article, Metrics.Event.view).meta(_this18.getConfig()).meta({
                  bf: article.backfill ? 1 : 0,
                  sf: article.shortfill ? 1 : 0,
                  spltfl_seg: okanjo.util.ifDefined(article.splitfill_segment)
                }).element(a).viewport().widget(_this18.element).send();
              });
            }
          }
        }); // Truncate product name to fit the space

        this.element.querySelectorAll('.okanjo-article .okanjo-resource-title').forEach(function (element) {
          okanjo.ui.ellipsify(element);
        });
      }
      /**
       * Handles the article click process
       * @param article
       * @param e
       * @private
       */

    }, {
      key: "_handleArticleClick",
      value: function _handleArticleClick(article, e) {
        // Update the event
        if (!article._event || !article._additionalParams || !article._clickId) {
          this._handleResourceMouseDown(Metrics.Object.article, article, e);
        } // Extract the already generated event and params list


        var event = article._event,
            additionalParams = article._additionalParams; // Update the event to the current one

        event.event(e); // Update the link a second time, just in case the data changed

        e.currentTarget.href = this._getClickThroughURL(event, article.url, additionalParams);
      } //endregion
      //region ADX Handling

      /**
       * Renders a DFP/ADX/GPT segment
       * @param data SmartServe segment data
       * @param segmentIndex Segment index number
       * @returns {string} Rendered segment HTML
       * @private
       */

    }, {
      key: "_renderADXSegment",
      value: function _renderADXSegment(data, segmentIndex) {
        // Get the template we should use to render the google ad
        var templateName = this._getTemplate(Placement.ContentTypes.adx, Placement.DefaultTemplates.adx); // Determine what size ad we can place here


        var size = null;

        if (this.config.size) {
          if (Placement.Sizes[this.config.size]) {
            // Defined size, use these known dimensions
            size = Placement.Sizes[this.config.size];
          } else {
            var match = /^([0-9]+)x([0-9]+)$/i.exec(this.config.size);

            if (match) {
              size = {
                width: match[1],
                height: match[2]
              };
            }
          }
        } // No given size, we need to guess


        if (!size) size = Placement.Sizes["default"]; // If we're using okanjo's ad slot, then track the impression
        // otherwise decline it because we're just passing through to the publishers account

        var adUnitPath = '/90447967/okanjo:<publisher>'; // let declineReason;

        if (data.settings.display && data.settings.display.adx_unit_path) {
          adUnitPath = data.settings.display.adx_unit_path; // declineReason = 'custom_ad_unit';
        } // Pass along what the template needs to know to display the ad


        var renderContext = this._getBaseRenderModel({
          size: size,
          adUnitPath: adUnitPath,
          segmentIndex: segmentIndex
        }); // Render the container


        return okanjo.ui.engine.render(templateName, this, renderContext);
      }
      /**
       * Handles post-render events for DFP/ADX/GPT resources
       * @private
       */

    }, {
      key: "_postADXRender",
      value: function _postADXRender() {
        var _this19 = this;

        // Insert the actual ads into their containers
        var segments = this._getResponseData();

        this.element.querySelectorAll('.okanjo-adx .okanjo-adx-container').forEach(function (container) {
          var path = container.getAttribute('data-path'),
              segment = parseInt(container.getAttribute('data-segment')),
              width = parseInt(container.getAttribute('data-width')),
              height = parseInt(container.getAttribute('data-height'));
          var data = segments[segment];
          /* istanbul ignore if: custom templates could break it */

          if (!data) return;
          var meta = {
            ta_s: path,
            ta_w: width,
            ta_h: height,
            spltfl_seg: okanjo.util.ifDefined(segment)
          }; // Make the frame element

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
            width: width,
            height: height
          }; // Apply attributes

          Object.keys(attributes).forEach(function (key) {
            return frame.setAttribute(key, attributes[key]);
          }); // Hold a ref to the frame for later

          data._frame = frame; // Attach to DOM

          container.appendChild(frame); // Build a click-through tracking url, so we know when an ad is clicked too

          var clickUrl = okanjo.metrics.create(_this19._metricBase).type(Metrics.Object.thirdparty_ad, Metrics.Event.interaction).meta(_this19.getConfig()).meta(meta).element(frame).viewport().widget(_this19.element).toUrl(); // Transfer references to the frame window
          // frame.contentWindow.okanjo = okanjo;
          // frame.contentWindow.placement = this;

          frame.contentWindow.trackImpression = function () {
            okanjo.metrics.create(_this19._metricBase).type(Metrics.Object.thirdparty_ad, Metrics.Event.impression).meta(_this19.getConfig()).meta(meta).element(frame).viewport().widget(_this19.element).send(); // Start watching for a viewable impression

            _this19._addOnceViewedHandler(frame, function () {
              okanjo.metrics.create(_this19._metricBase).type(Metrics.Object.thirdparty_ad, Metrics.Event.view).meta(_this19.getConfig()).meta(meta).element(frame).viewport().widget(_this19.element).send();
            });
          }; // Load Google ad!
          // See: https://developers.google.com/publisher-tag/reference#googletag.events.SlotRenderEndedEvent


          frame.contentWindow.document.open();
          frame.contentWindow.document.write("<html><head><style type=\"text/css\">html,body {margin: 0; padding: 0;}</style></head><body><div id=\"gpt-passback\">\n<" + "script type=\"text/javascript\" src=\"https://securepubads.g.doubleclick.net/tag/js/gpt.js\">\n    \n    window.googletag = window.googletag || {cmd: []};\n    googletag.cmd.push(function() {\n        \n        // Define the slot\n        googletag.defineSlot(\"".concat(path.replace(/"/g, '\\"'), "\", [[").concat(width, ", ").concat(height, "]], 'gpt-passback')\n            .setClickUrl(\"").concat(clickUrl, "&u=\")     // Track click event on the okanjo side\n            .addService(googletag.pubads())    // Service the ad\n        ;\n        \n        // Track load/view events\n        googletag.pubads().addEventListener('slotRenderEnded', function(e) { \n            trackImpression(e);\n        });\n        \n        // Go time\n        googletag.enableServices();\n        googletag.display('gpt-passback');\n    });\n    \n<") + "/script></div>\n</body></html>");
          frame.contentWindow.document.close(); // TODO future event hooks
          // googletag.pubads().addEventListener('impressionViewable', function(e) { future )});
          // googletag.pubads().addEventListener('slotOnload', function(e) { future });
          // googletag.pubads().addEventListener('slotVisibilityChangedEvent', function(e) { future );
          // Impression tracking is done from within the iframe. Crazy, right?
        });
      } //endregion

    }]);

    return Placement;
  }(okanjo._Widget); //region Enumerations

  /**
   * Standard ad sizes
   * @type {{billboard: {width: number, height: number}, button_2: {width: number, height: number}, half_page: {width: number, height: number}, leaderboard: {width: number, height: number}, medium_rectangle: {width: number, height: number}, micro_bar: {width: number, height: number}, portrait: {width: number, height: number}, rectangle: {width: number, height: number}, super_leaderboard: {width: number, height: number}, wide_skyscraper: {width: number, height: number}, large_mobile_banner: {width: number, height: number}, mobile_leaderboard: {width: number, height: number}, small_square: {width: number, height: number}, button_1: {width: number, height: number}, full_banner: {width: number, height: number}, half_banner: {width: number, height: number}, large_rectangle: {width: number, height: number}, pop_under: {width: number, height: number}, three_to_one_rectangle: {width: number, height: number}, skyscraper: {width: number, height: number}, square: {width: number, height: number}, square_button: {width: number, height: number}, vertical_banner: {width: number, height: number}, vertical_rectangle: {width: number, height: number}}}
   */


  Placement.Sizes = {
    // Supported
    medium_rectangle: {
      width: 300,
      height: 250
    },
    // aka: sidekick
    leaderboard: {
      width: 728,
      height: 90
    },
    large_mobile_banner: {
      width: 320,
      height: 100
    },
    half_page: {
      width: 300,
      height: 600
    },
    // aka: filmstrip, sidekick
    billboard: {
      width: 970,
      height: 250
    },
    // aka: sidekick
    // IAB / Others
    button_2: {
      width: 120,
      height: 60
    },
    micro_bar: {
      width: 88,
      height: 31
    },
    portrait: {
      width: 300,
      height: 1050
    },
    rectangle: {
      width: 180,
      height: 150
    },
    super_leaderboard: {
      width: 970,
      height: 90
    },
    // aka: pushdown, slider, large_leaderboard
    wide_skyscraper: {
      width: 160,
      height: 600
    },
    // Google
    mobile_leaderboard: {
      width: 320,
      height: 50
    },
    small_square: {
      width: 200,
      height: 200
    },
    // Retired / Deprecated
    button_1: {
      width: 120,
      height: 90
    },
    full_banner: {
      width: 468,
      height: 60
    },
    half_banner: {
      width: 234,
      height: 60
    },
    large_rectangle: {
      width: 336,
      height: 280
    },
    pop_under: {
      width: 720,
      height: 300
    },
    three_to_one_rectangle: {
      width: 300,
      height: 100
    },
    skyscraper: {
      width: 120,
      height: 600
    },
    square: {
      width: 250,
      height: 250
    },
    square_button: {
      width: 125,
      height: 125
    },
    vertical_banner: {
      width: 120,
      height: 240
    },
    vertical_rectangle: {
      width: 240,
      height: 400
    }
  }; // When we should show an ad but nobody told us what size

  Placement.Sizes["default"] = Placement.Sizes.medium_rectangle;
  /**
   * Placement content types
   * @type {{adx: string, articles: string, products: string, mixed: string, container: string}}
   */

  Placement.ContentTypes = {
    products: 'products',
    // only products
    articles: 'articles',
    // only articles
    adx: 'adx',
    // only display ad
    mixed: 'mixed',
    // mix of two or more of the above (used for metrics responses, not a template)
    container: 'container' // Widget container - segment content gets rendered into this one at the end

  };
  /**
   * Default templates for each content type
   * @type {{products: string, articles: string, adx: string, container: string}}
   */

  Placement.DefaultTemplates = {
    products: 'block2',
    articles: 'block2',
    adx: 'block2',
    container: 'block2'
  }; //endregion

  return okanjo.Placement = Placement;
})(window); // **********
// DEPRECATED - USE okanjo.Placement instead!
// **********
//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols


(function (window) {
  var okanjo = window.okanjo;
  /**
   * Backwards compatible interface, turning a Product widget into a placement widget
   * @deprecated
   */

  var Product = /*#__PURE__*/function (_okanjo$Placement) {
    _inherits(Product, _okanjo$Placement);

    var _super3 = _createSuper(Product);

    function Product(element, options) {
      var _this20;

      _classCallCheck(this, Product);

      // Initialize placement w/o loading (we need to jack the config)
      options = options || {};
      var no_init = options.no_init; // hold original no_init flag, if set

      options.no_init = true;
      _this20 = _super3.call(this, element, options);
      okanjo.warn('Product widget has been deprecated. Use Placement instead (may require configuration changes)', {
        widget: _assertThisInitialized(_this20)
      }); // Start loading content

      if (!no_init) {
        delete _this20.config.no_init;

        _this20.init();
      }

      return _this20;
    } //noinspection JSUnusedGlobalSymbols

    /**
     * Converts the old product widget configuration into a usable placement configuration
     */


    _createClass(Product, [{
      key: "_setCompatibilityOptions",
      value: function _setCompatibilityOptions() {
        // Convert the product config to a placement configuration
        this.config.backwards = 'Product';
        this.config.type = okanjo.Placement.ContentTypes.products; // Set filters based on old "mode"

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

        delete this.config.mode; // Sold by changed to store name

        if (this.config.sold_by) {
          this.config.store_name = this.config.sold_by;
          delete this.config.sold_by;
        } // Selectors is now url_selectors


        if (this.config.selectors) {
          this.config.url_selectors = this.config.selectors;
          delete this.config.selectors;
        } // Marketplace_id is no longer a thing, closest analog are properties.


        if (this.config.marketplace_id) {
          this.config.property_id = this.config.marketplace_id;
          delete this.config.marketplace_id;
        } // Marketplace status is no longer a thing, instead, use the sandbox environment for testing


        if (this.config.marketplace_status === 'testing') {
          this.config.sandbox = true;
        }

        delete this.config.marketplace_status; // Deprecated

        delete this.config.suboptimal;
        delete this.config.text;
      }
    }]);

    return Product;
  }(okanjo.Placement);

  return okanjo.Product = Product;
})(window); // **********
// DEPRECATED - USE okanjo.Placement instead!
// **********
//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols


(function (window) {
  var okanjo = window.okanjo;
  /**
   * Backwards compatible interface, turning an Ad widget into a placement widget
   * @deprecated
   */

  var Ad = /*#__PURE__*/function (_okanjo$Placement2) {
    _inherits(Ad, _okanjo$Placement2);

    var _super4 = _createSuper(Ad);

    function Ad(element, options) {
      var _this21;

      _classCallCheck(this, Ad);

      // Initialize placement w/o loading (we need to jack the config)
      options = options || {};
      var no_init = options.no_init; // hold original no_init flag, if set

      options.no_init = true;
      _this21 = _super4.call(this, element, options);
      okanjo.warn('Ad widget has been deprecated. Use Placement instead (may require configuration changes)', {
        widget: _assertThisInitialized(_this21)
      }); // Start loading content

      if (!no_init) {
        delete _this21.config.no_init;

        _this21.init();
      }

      return _this21;
    } //noinspection JSUnusedGlobalSymbols

    /**
     * Converts the old product widget configuration into a usable placement configuration
     */


    _createClass(Ad, [{
      key: "_setCompatibilityOptions",
      value: function _setCompatibilityOptions() {
        // Convert the product config to a placement configuration
        this.config.backwards = 'Ad';
        this.config.type = okanjo.Placement.ContentTypes.products; // Id / single mode is now ids

        this.config.url = null;

        if (this.config.id) {
          this.config.ids = [this.config.id];
        } else {
          okanjo.warn('Ad widget should have parameter `id` set.');
        }

        this.config.take = 1;
        delete this.config.id; // Content is automatically determined whether the placement element contains children

        delete this.config.content;
      }
    }]);

    return Ad;
  }(okanjo.Placement);

  return okanjo.Ad = Ad;
})(window);
/* jshint ignore:start */


(function () {
  (function (global, factory) {
    (typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global = global || self, global.Mustache = factory());
  })(this, function () {
    'use strict';
    /*!
     * mustache.js - Logic-less {{mustache}} templates with JavaScript
     * http://github.com/janl/mustache.js
     */

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
      return isArray(obj) ? 'array' : _typeof(obj);
    }

    function escapeRegExp(string) {
      return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
    }
    /**
     * Null safe way of checking whether or not an object,
     * including its prototype, has a given property
     */


    function hasProperty(obj, propName) {
      return obj != null && _typeof(obj) === 'object' && propName in obj;
    }
    /**
     * Safe way of detecting whether or not the given thing is a primitive and
     * whether it has the given property
     */


    function primitiveHasOwnProperty(primitive, propName) {
      return primitive != null && _typeof(primitive) !== 'object' && primitive.hasOwnProperty && primitive.hasOwnProperty(propName);
    } // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
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
     *
     * Tokens for partials also contain two more elements: 1) a string value of
     * indendation prior to that tag and 2) the index of that tag on that line -
     * eg a value of 2 indicates the partial is the third tag on this line.
     */

    function parseTemplate(template, tags) {
      if (!template) return [];
      var lineHasNonSpace = false;
      var sections = []; // Stack to hold section tokens

      var tokens = []; // Buffer to hold the tokens

      var spaces = []; // Indices of whitespace tokens on the current line

      var hasTag = false; // Is there a {{tag}} on the current line?

      var nonSpace = false; // Is there a non-space char on the current line?

      var indentation = ''; // Tracks indentation for tags that use it

      var tagIndex = 0; // Stores a count of number of tags encountered on a line
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
        start = scanner.pos; // Match any text between tags.

        value = scanner.scanUntil(openingTagRe);

        if (value) {
          for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
            chr = value.charAt(i);

            if (isWhitespace(chr)) {
              spaces.push(tokens.length);
              indentation += chr;
            } else {
              nonSpace = true;
              lineHasNonSpace = true;
              indentation += ' ';
            }

            tokens.push(['text', chr, start, start + 1]);
            start += 1; // Check for whitespace on the current line.

            if (chr === '\n') {
              stripSpace();
              indentation = '';
              tagIndex = 0;
              lineHasNonSpace = false;
            }
          }
        } // Match the opening tag.


        if (!scanner.scan(openingTagRe)) break;
        hasTag = true; // Get the tag type.

        type = scanner.scan(tagRe) || 'name';
        scanner.scan(whiteRe); // Get the tag value.

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
        } // Match the closing tag.


        if (!scanner.scan(closingTagRe)) throw new Error('Unclosed tag at ' + scanner.pos);

        if (type == '>') {
          token = [type, value, start, scanner.pos, indentation, tagIndex, lineHasNonSpace];
        } else {
          token = [type, value, start, scanner.pos];
        }

        tagIndex++;
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

      stripSpace(); // Make sure there are no open sections when we're done.

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
      this.cache = {
        '.': this.view
      };
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
            intermediateValue,
            names,
            index,
            lookupHit = false;

        while (context) {
          if (name.indexOf('.') > 0) {
            intermediateValue = context.view;
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
             *
             * In the case where dot notation is used, we consider the lookup
             * to be successful even if the last "object" in the path is
             * not actually an object but a primitive (e.g., a string, or an
             * integer), because it is sometimes useful to access a property
             * of an autoboxed primitive, such as the length of a string.
             **/

            while (intermediateValue != null && index < names.length) {
              if (index === names.length - 1) lookupHit = hasProperty(intermediateValue, names[index]) || primitiveHasOwnProperty(intermediateValue, names[index]);
              intermediateValue = intermediateValue[names[index++]];
            }
          } else {
            intermediateValue = context.view[name];
            /**
             * Only checking against `hasProperty`, which always returns `false` if
             * `context.view` is not an object. Deliberately omitting the check
             * against `primitiveHasOwnProperty` if dot notation is not used.
             *
             * Consider this example:
             * ```
             * Mustache.render("The length of a football field is {{#length}}{{length}}{{/length}}.", {length: "100 yards"})
             * ```
             *
             * If we were to check also against `primitiveHasOwnProperty`, as we do
             * in the dot notation case, then render call would return:
             *
             * "The length of a football field is 9."
             *
             * rather than the expected:
             *
             * "The length of a football field is 100 yards."
             **/

            lookupHit = hasProperty(context.view, name);
          }

          if (lookupHit) {
            value = intermediateValue;
            break;
          }

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
      this.templateCache = {
        _cache: {},
        set: function set(key, value) {
          this._cache[key] = value;
        },
        get: function get(key) {
          return this._cache[key];
        },
        clear: function clear() {
          this._cache = {};
        }
      };
    }
    /**
     * Clears all cached templates in this writer.
     */


    Writer.prototype.clearCache = function clearCache() {
      if (typeof this.templateCache !== 'undefined') {
        this.templateCache.clear();
      }
    };
    /**
     * Parses and caches the given `template` according to the given `tags` or
     * `mustache.tags` if `tags` is omitted,  and returns the array of tokens
     * that is generated from the parse.
     */


    Writer.prototype.parse = function parse(template, tags) {
      var cache = this.templateCache;
      var cacheKey = template + ':' + (tags || mustache.tags).join(':');
      var isCacheEnabled = typeof cache !== 'undefined';
      var tokens = isCacheEnabled ? cache.get(cacheKey) : undefined;

      if (tokens == undefined) {
        tokens = parseTemplate(template, tags);
        isCacheEnabled && cache.set(cacheKey, tokens);
      }

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
     *
     * If the optional `config` argument is given here, then it should be an
     * object with a `tags` attribute or an `escape` attribute or both.
     * If an array is passed, then it will be interpreted the same way as
     * a `tags` attribute on a `config` object.
     *
     * The `tags` attribute of a `config` object must be an array with two
     * string values: the opening and closing tags used in the template (e.g.
     * [ "<%", "%>" ]). The default is to mustache.tags.
     *
     * The `escape` attribute of a `config` object must be a function which
     * accepts a string as input and outputs a safely escaped string.
     * If an `escape` function is not provided, then an HTML-safe string
     * escaping function is used as the default.
     */


    Writer.prototype.render = function render(template, view, partials, config) {
      var tags = this.getConfigTags(config);
      var tokens = this.parse(template, tags);
      var context = view instanceof Context ? view : new Context(view, undefined);
      return this.renderTokens(tokens, context, partials, template, config);
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


    Writer.prototype.renderTokens = function renderTokens(tokens, context, partials, originalTemplate, config) {
      var buffer = '';
      var token, symbol, value;

      for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
        value = undefined;
        token = tokens[i];
        symbol = token[0];
        if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate, config);else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate, config);else if (symbol === '>') value = this.renderPartial(token, context, partials, config);else if (symbol === '&') value = this.unescapedValue(token, context);else if (symbol === 'name') value = this.escapedValue(token, context, config);else if (symbol === 'text') value = this.rawValue(token);
        if (value !== undefined) buffer += value;
      }

      return buffer;
    };

    Writer.prototype.renderSection = function renderSection(token, context, partials, originalTemplate, config) {
      var self = this;
      var buffer = '';
      var value = context.lookup(token[1]); // This function is used to render an arbitrary template
      // in the current context by higher-order sections.

      function subRender(template) {
        return self.render(template, context, partials, config);
      }

      if (!value) return;

      if (isArray(value)) {
        for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
          buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate, config);
        }
      } else if (_typeof(value) === 'object' || typeof value === 'string' || typeof value === 'number') {
        buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate, config);
      } else if (isFunction(value)) {
        if (typeof originalTemplate !== 'string') throw new Error('Cannot use higher-order sections without the original template'); // Extract the portion of the original template that the section contains.

        value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);
        if (value != null) buffer += value;
      } else {
        buffer += this.renderTokens(token[4], context, partials, originalTemplate, config);
      }

      return buffer;
    };

    Writer.prototype.renderInverted = function renderInverted(token, context, partials, originalTemplate, config) {
      var value = context.lookup(token[1]); // Use JavaScript's definition of falsy. Include empty arrays.
      // See https://github.com/janl/mustache.js/issues/186

      if (!value || isArray(value) && value.length === 0) return this.renderTokens(token[4], context, partials, originalTemplate, config);
    };

    Writer.prototype.indentPartial = function indentPartial(partial, indentation, lineHasNonSpace) {
      var filteredIndentation = indentation.replace(/[^ \t]/g, '');
      var partialByNl = partial.split('\n');

      for (var i = 0; i < partialByNl.length; i++) {
        if (partialByNl[i].length && (i > 0 || !lineHasNonSpace)) {
          partialByNl[i] = filteredIndentation + partialByNl[i];
        }
      }

      return partialByNl.join('\n');
    };

    Writer.prototype.renderPartial = function renderPartial(token, context, partials, config) {
      if (!partials) return;
      var tags = this.getConfigTags(config);
      var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];

      if (value != null) {
        var lineHasNonSpace = token[6];
        var tagIndex = token[5];
        var indentation = token[4];
        var indentedValue = value;

        if (tagIndex == 0 && indentation) {
          indentedValue = this.indentPartial(value, indentation, lineHasNonSpace);
        }

        var tokens = this.parse(indentedValue, tags);
        return this.renderTokens(tokens, context, partials, indentedValue, config);
      }
    };

    Writer.prototype.unescapedValue = function unescapedValue(token, context) {
      var value = context.lookup(token[1]);
      if (value != null) return value;
    };

    Writer.prototype.escapedValue = function escapedValue(token, context, config) {
      var escape = this.getConfigEscape(config) || mustache.escape;
      var value = context.lookup(token[1]);
      if (value != null) return typeof value === 'number' && escape === mustache.escape ? String(value) : escape(value);
    };

    Writer.prototype.rawValue = function rawValue(token) {
      return token[1];
    };

    Writer.prototype.getConfigTags = function getConfigTags(config) {
      if (isArray(config)) {
        return config;
      } else if (config && _typeof(config) === 'object') {
        return config.tags;
      } else {
        return undefined;
      }
    };

    Writer.prototype.getConfigEscape = function getConfigEscape(config) {
      if (config && _typeof(config) === 'object' && !isArray(config)) {
        return config.escape;
      } else {
        return undefined;
      }
    };

    var mustache = {
      name: 'mustache.js',
      version: '4.2.0',
      tags: ['{{', '}}'],
      clearCache: undefined,
      escape: undefined,
      parse: undefined,
      render: undefined,
      Scanner: undefined,
      Context: undefined,
      Writer: undefined,

      /**
       * Allows a user to override the default caching strategy, by providing an
       * object with set, get and clear methods. This can also be used to disable
       * the cache by setting it to the literal `undefined`.
       */
      set templateCache(cache) {
        defaultWriter.templateCache = cache;
      },

      /**
       * Gets the default or overridden caching object from the default writer.
       */
      get templateCache() {
        return defaultWriter.templateCache;
      }

    }; // All high-level mustache.* functions use this writer.

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
     * Renders the `template` with the given `view`, `partials`, and `config`
     * using the default writer.
     */


    mustache.render = function render(template, view, partials, config) {
      if (typeof template !== 'string') {
        throw new TypeError('Invalid template! Template should be a "string" ' + 'but "' + typeStr(template) + '" was given as the first ' + 'argument for mustache#render(template, view, partials)');
      }

      return defaultWriter.render(template, view, partials, config);
    }; // Export the escaping function so that the user may override it.
    // See https://github.com/janl/mustache.js/issues/244


    mustache.escape = escapeHtml; // Export these mainly for testing, but also for advanced usage.

    mustache.Scanner = Scanner;
    mustache.Context = Context;
    mustache.Writer = Writer;
    return mustache;
  });
}).apply(okanjo.lib);
/* jshint ignore:end */
return okanjo;
}));

/*! okanjo-js v3.5.1 | (c) 2013 Okanjo Partners Inc | https://okanjo.com/ */
(function(okanjo) {(function (window) {
  var okanjo = window.okanjo;
  okanjo.ui.engine.registerCss("adx.block2", ".okanjo-expansion-root{position:relative}.okanjo-expansion-root iframe.okanjo-ad-in-unit{position:absolute;top:0;left:0;right:0;bottom:0;z-index:1}.okanjo-align-start{display:flex;align-items:flex-start}.okanjo-align-end{display:flex;align-items:flex-end}.okanjo-align-center{display:flex;align-items:center}.okanjo-align-baseline{display:flex;align-items:baseline}.okanjo-align-stretch{display:flex;align-items:stretch}.okanjo-justify-start{display:flex;justify-content:flex-start}.okanjo-justify-end{display:flex;justify-content:flex-end}.okanjo-justify-center{display:flex;justify-content:center}.okanjo-justify-between{display:flex;justify-content:space-between}.okanjo-justify-around{display:flex;justify-content:space-around}.okanjo-justify-evenly{display:flex;justify-content:space-evenly}.okanjo-block2 .okanjo-adx{padding:0}.okanjo-block2 .okanjo-adx:after,.okanjo-block2 .okanjo-adx:before{content:\" \";display:table}.okanjo-block2 .okanjo-adx:after{clear:both}.okanjo-block2 .okanjo-adx .okanjo-visually-hidden{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.okanjo-block2 .okanjo-adx .okanjo-adx-container{text-align:center;padding:0;line-height:0}.okanjo-block2 .okanjo-adx .okanjo-adx-frame{margin:0}", {
    id: 'okanjo-adx-block2'
  });
  okanjo.ui.engine.registerTemplate("adx.block2", "<div class=\"okanjo-resource okanjo-adx\"><div class=okanjo-adx-container data-size={{size.width}}x{{size.height}} data-width={{size.width}} data-height={{size.height}} data-path={{adUnitPath}} data-segment={{segmentIndex}}></div><div class=okanjo-visually-hidden><img alt=\"\" src=\"//cdn.okanjo.com/px/1.gif?n={{ now }}\"></div></div>", function (model) {
    // Attach required properties
    model.config = this.config;
    model.instanceId = this.instanceId;
    model.metricParams = okanjo.net.request.stringify(this._metricBase);
    return model;
  }, {
    css: ['adx.block2', 'okanjo.block2']
  });
})(window);

(function (window) {
  var okanjo = window.okanjo;
  okanjo.ui.engine.registerCss("articles.block2", ".okanjo-block2 .okanjo-article.okanjo-cta-style-button .okanjo-resource-title-container{height:52px}.okanjo-block2 .okanjo-article .okanjo-resource-title-container.modern{height:44px}.okanjo-block2.leaderboard .okanjo-article .okanjo-resource-title-container{margin-top:2px;margin-bottom:4px}", {
    id: 'okanjo-article-block2'
  });
  okanjo.ui.__article_block2 = "{{#resources}}<div class=\"okanjo-resource okanjo-article {{#config}}{{ template_layout }}{{/config}}\" itemscope itemtype=https://schema.org/Article><a href=\"//{{ okanjoMetricUrl }}/metrics/am/int?m[bot]=true&id={{ id }}&{{ metricParams }}&n={{ now }}&u={{ _escaped_url }}\" data-id=\"{{ id }}\" data-index=\"{{ _index }}\" data-segment=\"{{ _segmentIndex }}\" data-type=article data-backfill=\"{{ backfill }}\" target=_blank itemprop=url title=\"Read More: {{ title }}\"><div class=okanjo-resource-image-container>{{#image}} <img alt=\"\" class=\"okanjo-resource-image {{ fitImage }}\" src=\"{{ image }}\" title=\"{{ name }}\" itemprop=image data-id=\"{{ id }}\"> {{/image}} {{^image}} {{{fallbackSVG}}} {{/image}}</div><div class=okanjo-resource-info-container><div class=okanjo-resource-publisher-container itemprop=publisher itemscope itemtype=https://schema.org/Organization><span class=okanjo-resource-publisher itemprop=name title=\"{{ publisher_name }}\">{{ publisher_name }}{{^publisher_name}}&nbsp;{{/publisher_name}}</span></div><div class=okanjo-resource-title-container><span class=okanjo-resource-title itemprop=name>{{ title }}</span></div><div class=\"okanjo-resource-description-container okanjo-visually-hidden\"><div class=okanjo-resource-description itemprop=description>{{ description }}</div></div><div><div class=okanjo-resource-button-container><div class=\"okanjo-resource-cta-button {{button_classes}}\"><span>{{meta.cta_text}}{{^meta.cta_text}}{{#config}}{{ template_cta_text }}{{^template_cta_text}}Read Now{{/template_cta_text}}{{/config}}{{/meta.cta_text}}</span></div><meta property=url itemprop=url content=\"//{{ okanjoMetricUrl }}/metrics/am/int?m[bot]=true&m[microdata]=true&id={{ id }}&{{ metricParams }}&n={{ now }}&u={{ _escaped_url }}\"></div></div><div class=\"okanjo-resource-meta okanjo-visually-hidden\">{{#author}}<span itemprop=author>{{ author }}</span>{{/author}} {{#published}}<span itemprop=dateCreated>{{ published }}</span>{{/published}} <img alt=\"\" src=\"//cdn.okanjo.com/px/1.gif?n={{ now }}\"></div></div></a></div>{{/resources}}";
  okanjo.ui.engine.registerTemplate("articles.block2", okanjo.ui.__article_block2, function (model) {
    model.config = this.config;
    model.instanceId = this.instanceId;
    model.metricChannel = this._metricBase.ch;
    model.metricContext = this._metricBase.cx;
    model.metricParams = okanjo.net.request.stringify(this._metricBase);
    model.fallbackSVG = okanjo.ui.articleSVG(); // Enforce format restrictions

    this._enforceLayoutOptions(); // Add branding if necessary


    this._registerCustomBranding('.okanjo-article', 'button');

    return model;
  }, {
    css: [
    /*'okanjo.core',*/
    'articles.block2', 'okanjo.block2'
    /*, 'okanjo.modal'*/
    ]
  });
})(window);

(function (window) {
  var okanjo = window.okanjo;
  okanjo.ui.engine.registerCss("articles.slab", "", {
    id: 'okanjo-article-slab'
  }); // Reuses block2 markup layout, extended css

  okanjo.ui.engine.registerTemplate("articles.slab", okanjo.ui.__article_block2, function (model) {
    model.blockClasses = ['okanjo-slab'];
    model.config = this.config;
    model.instanceId = this.instanceId;
    model.metricChannel = this._metricBase.ch;
    model.metricContext = this._metricBase.cx;
    model.metricParams = okanjo.net.request.stringify(this._metricBase);
    model.fallbackSVG = okanjo.ui.articleSVG();
    model.fitImage = 'okanjo-fit'; // Enforce format restrictions
    // this._enforceLayoutOptions();

    this._enforceSlabLayoutOptions(); // Add branding if necessary


    this._registerCustomBranding('.okanjo-article', 'button');

    return model;
  }, {
    css: ['articles.slab', 'okanjo.slab', 'okanjo.block2']
  });
})(window);

(function (window) {
  var okanjo = window.okanjo;
  okanjo.ui.engine.registerCss("okanjo.block2", ".okanjo-expansion-root{position:relative}.okanjo-expansion-root iframe.okanjo-ad-in-unit{position:absolute;top:0;left:0;right:0;bottom:0;z-index:1}.okanjo-align-start{display:flex;align-items:flex-start}.okanjo-align-end{display:flex;align-items:flex-end}.okanjo-align-center{display:flex;align-items:center}.okanjo-align-baseline{display:flex;align-items:baseline}.okanjo-align-stretch{display:flex;align-items:stretch}.okanjo-justify-start{display:flex;justify-content:flex-start}.okanjo-justify-end{display:flex;justify-content:flex-end}.okanjo-justify-center{display:flex;justify-content:center}.okanjo-justify-between{display:flex;justify-content:space-between}.okanjo-justify-around{display:flex;justify-content:space-around}.okanjo-justify-evenly{display:flex;justify-content:space-evenly}.okanjo-block2{color:#333;font-size:12px/1.2;font-family:inherit}.okanjo-block2:after,.okanjo-block2:before{content:\" \";display:table}.okanjo-block2:after{clear:both}.okanjo-block2.theme-newsprint .okanjo-resource-seller-container{font-family:Georgia,serif}.okanjo-block2.theme-newsprint .okanjo-resource-title-container{font:13px/15px Georgia,serif}.okanjo-block2.theme-modern,.okanjo-block2.theme-newsprint .okanjo-resource-buy-button,.okanjo-block2.theme-newsprint .okanjo-resource-cta-button,.okanjo-block2.theme-newsprint .okanjo-resource-price-container{font-family:\"Helvetica Neue\",Helvetica,Roboto,Arial,sans-serif}.okanjo-block2 .okanjo-ellipses:after{content:\"...\"}.okanjo-block2 .okanjo-visually-hidden{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.okanjo-block2 .okanjo-invisible{visibility:hidden}.okanjo-block2 .okanjo-resource{display:block;float:left;background-color:#fff;box-sizing:content-box;width:148px;border:1px solid #e6e6e6;margin:0 -1px -1px 0}.okanjo-block2 .okanjo-resource:last-child{margin:0}.okanjo-block2 a{display:block;overflow:hidden;color:#333;text-decoration:none;padding:10px}.okanjo-block2 a:hover{color:inherit;text-decoration:none}.okanjo-block2 .okanjo-resource-image-container{float:left;overflow:hidden;text-align:center;vertical-align:middle;width:100%;height:128px;line-height:127px;margin:0 0 3px}.okanjo-block2 .okanjo-resource-image{max-width:100%;max-height:100%;border:none;vertical-align:middle}.okanjo-block2 .okanjo-resource-info-container{float:left;height:auto;width:100%}.okanjo-block2 .okanjo-resource-publisher-container,.okanjo-block2 .okanjo-resource-seller-container{color:#999;font-size:11px;line-height:12px;height:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.okanjo-block2 .okanjo-resource-title-container{overflow:hidden;margin-top:3px;margin-bottom:4px;font-weight:700;font-size:12px;line-height:14px;height:45px;word-wrap:break-word}.okanjo-block2 .okanjo-resource-title-container span{display:inline-block}.lt-ie8.okanjo-block2 .okanjo-resource-title-container span{display:inline;zoom:1}.okanjo-block2 .okanjo-resource-price-container{font-size:15px;line-height:1;margin-bottom:5px}.okanjo-block2 .okanjo-resource-buy-button,.okanjo-block2 .okanjo-resource-cta-button{color:#09f;font-size:12px;line-height:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.okanjo-block2 .okanjo-resource.list{width:298px;height:122px}.okanjo-block2 .okanjo-resource.list a{padding:11px}.okanjo-block2 .okanjo-resource.list .okanjo-resource-title-container{margin-top:4px;margin-bottom:6px}.okanjo-block2 .okanjo-resource.list .okanjo-resource-image-container{width:100px;height:100px;line-height:1px;margin:0 11px 0 0}.okanjo-block2 .okanjo-resource.list .okanjo-resource-info-container{height:auto;float:none}.okanjo-block2.okanjo-cta-style-button .okanjo-resource-title-container{height:30px}.okanjo-block2.okanjo-cta-style-button .okanjo-resource-buy-button,.okanjo-block2.okanjo-cta-style-button .okanjo-resource-cta-button{display:block;text-align:center;line-height:26px;padding:0 8px;border:1px solid #09f;border-radius:2px;transition:50ms}.okanjo-block2.okanjo-cta-style-button .okanjo-resource-buy-button:hover,.okanjo-block2.okanjo-cta-style-button .okanjo-resource-cta-button:hover{background:#09f;color:#fff}.okanjo-block2.okanjo-cta-style-button .okanjo-resource-buy-button:active,.okanjo-block2.okanjo-cta-style-button .okanjo-resource-cta-button:active{box-shadow:inset 0 3px 10px rgba(0,0,0,.15)}.okanjo-block2.okanjo-cta-style-button .okanjo-resource-buy-button.invert,.okanjo-block2.okanjo-cta-style-button .okanjo-resource-cta-button.invert{background:#09f;color:#fff}.okanjo-block2.okanjo-cta-style-button .okanjo-resource-buy-button.invert:hover,.okanjo-block2.okanjo-cta-style-button .okanjo-resource-cta-button.invert:hover{background:#fff;color:#09f}.okanjo-block2.medium_rectangle{width:300px;height:250px;overflow:hidden}.okanjo-block2.medium_rectangle .okanjo-resource{width:148px;height:248px}.okanjo-block2.medium_rectangle .okanjo-resource:first-child{width:149px;height:248px}.okanjo-block2.medium_rectangle .okanjo-resource.list{width:298px;height:123px}.okanjo-block2.medium_rectangle .okanjo-resource.list .okanjo-resource-image-container{width:100px;height:100px;line-height:1px}.okanjo-block2.medium_rectangle .okanjo-resource.list .okanjo-resource-info-container{height:auto;float:left;width:165px}.okanjo-block2.medium_rectangle .okanjo-resource.list:first-child{height:124px}.okanjo-block2.medium_rectangle .okanjo-resource.list:first-child a{padding-top:12px}.okanjo-block2.leaderboard{width:728px;height:90px;overflow:hidden}.okanjo-block2.leaderboard .okanjo-resource{width:241px;height:88px}.okanjo-block2.leaderboard .okanjo-resource:first-child{width:242px}.okanjo-block2.leaderboard .okanjo-resource a{padding:7px}.okanjo-block2.leaderboard .okanjo-resource .okanjo-resource-image-container{width:74px;height:74px;line-height:1px;margin:0 7px 0 0}.okanjo-block2.leaderboard .okanjo-resource .okanjo-resource-title-container{font-size:11px;line-height:13px;height:26px;margin-top:1px;margin-bottom:4px}.okanjo-block2.leaderboard .okanjo-resource .okanjo-resource-price-container{margin-bottom:3px}.okanjo-block2.leaderboard.theme-newsprint .okanjo-resource-title-container{font:bold 11px/13px Georgia,serif}.okanjo-block2.half_page{width:300px;height:600px;overflow:hidden}.okanjo-block2.half_page .okanjo-resource{height:118px}.okanjo-block2.half_page .okanjo-resource:nth-last-child(n+2){height:119px}.okanjo-block2.half_page .okanjo-resource .okanjo-resource-image-container{width:96px;height:96px}.okanjo-block2.half_page .okanjo-resource .okanjo-resource-title-container{margin-bottom:3px}.okanjo-block2.large_mobile_banner{width:320px;height:100px;overflow:hidden}.okanjo-block2.large_mobile_banner .okanjo-resource{width:318px;height:98px}.okanjo-block2.large_mobile_banner .okanjo-resource a{padding:6px}.okanjo-block2.large_mobile_banner .okanjo-resource .okanjo-resource-image-container{width:86px;height:86px}.okanjo-block2.large_mobile_banner .okanjo-resource .okanjo-resource-title-container{height:30px}.okanjo-block2.billboard{width:970px;height:250px;overflow:hidden}.okanjo-block2.billboard .okanjo-resource{width:160px;height:248px}.okanjo-block2.billboard .okanjo-resource:first-child{width:163px;height:248px}.okanjo-block2.billboard .okanjo-resource.list{width:322px;height:123px}.okanjo-block2.billboard .okanjo-resource.list .okanjo-resource-image-container{width:100px;height:100px;line-height:1px}.okanjo-block2.billboard .okanjo-resource.list .okanjo-resource-info-container{height:auto;float:left;width:165px}.okanjo-block2.auto{font-size:1em;width:100%}.okanjo-block2.auto .okanjo-resource{width:100%;height:auto;border-left:none;border-right:none}.okanjo-block2.auto .okanjo-resource a{max-width:500px;width:95%;margin:0 auto;padding:2.5%}.okanjo-block2.auto .okanjo-resource.list{height:auto}.okanjo-block2.auto .okanjo-resource.list .okanjo-resource-image-container{width:18%;height:auto;line-height:1px}.okanjo-block2.auto .okanjo-resource.list .okanjo-resource-info-container{height:auto;float:none;margin-left:21%;width:79%}.okanjo-block2.auto .okanjo-resource.list .okanjo-resource-publisher-container,.okanjo-block2.auto .okanjo-resource.list .okanjo-resource-seller-container{height:auto;font-size:12px;line-height:1.2}.okanjo-block2.auto .okanjo-resource.list .okanjo-resource-price-container{height:auto;font-size:15px;line-height:1.5}.okanjo-block2.auto .okanjo-resource.list .okanjo-resource-title-container{font-size:15px;line-height:1.4;height:auto}.okanjo-block2.auto .okanjo-resource.list .okanjo-resource-buy-button,.okanjo-block2.auto .okanjo-resource.list .okanjo-resource-cta-button{display:inline-block;font-size:14px;line-height:1.8;margin-bottom:-1.7%}.okanjo-block2.auto.okanjo-cta-style-button .okanjo-resource.list .okanjo-resource-price-container{line-height:1.3}.okanjo-block2.auto.okanjo-cta-style-button .okanjo-resource.list .okanjo-resource-title-container{line-height:1.25}.okanjo-block2.auto.okanjo-cta-style-button .okanjo-resource.list .okanjo-resource-buy-button,.okanjo-block2.auto.okanjo-cta-style-button .okanjo-resource.list .okanjo-resource-cta-button{font-size:13px}.okanjo-inline-buy-frame{display:block;height:100%;width:100%}", {
    id: 'okanjo-block2'
  });
  okanjo.ui.__block2 = "<div class=\"okanjo-block2 okanjo-expansion-root {{ classDetects }} {{#config}} {{ size }} {{ template_variant }} theme-{{ template_theme }}{{^template_theme}}modern{{/template_theme}} okanjo-cta-style-{{ template_cta_style }}{{^template_cta_style}}link{{/template_cta_style}}{{/config}} okanjo-wgid-{{ instanceId }}\"><div class=okanjo-resource-list itemscope itemtype=https://schema.org/ItemList data-instance-id=\"{{ instanceId }}\">{{{ segmentContent }}}</div><div class=\"okanjo-resource-meta okanjo-visually-hidden\"></div></div>";
  okanjo.ui.engine.registerTemplate("container.block2", okanjo.ui.__block2, function (model) {
    model.config = this.config;
    model.instanceId = this.instanceId;
    return model;
  }, {
    css: ['okanjo.block2', 'okanjo.modal']
  });
})(window);

(function (window) {
  var okanjo = window.okanjo;
  okanjo.ui.engine.registerCss("okanjo.core", "", {
    id: 'okanjo-core'
  });
  okanjo.ui.engine.registerCss("okanjo.modal", ".okanjo-expansion-root{position:relative}.okanjo-expansion-root iframe.okanjo-ad-in-unit{position:absolute;top:0;left:0;right:0;bottom:0;z-index:1}.okanjo-align-start{display:flex;align-items:flex-start}.okanjo-align-end{display:flex;align-items:flex-end}.okanjo-align-center{display:flex;align-items:center}.okanjo-align-baseline{display:flex;align-items:baseline}.okanjo-align-stretch{display:flex;align-items:stretch}.okanjo-justify-start{display:flex;justify-content:flex-start}.okanjo-justify-end{display:flex;justify-content:flex-end}.okanjo-justify-center{display:flex;justify-content:center}.okanjo-justify-between{display:flex;justify-content:space-between}.okanjo-justify-around{display:flex;justify-content:space-around}.okanjo-justify-evenly{display:flex;justify-content:space-evenly}html.okanjo-modal-active{overflow:hidden!important}html.okanjo-modal-active body{overflow:hidden!important;margin:0}.okanjo-modal-margin-fix{margin-right:15px!important}.okanjo-modal-container{position:fixed;top:0;right:0;left:0;bottom:0;z-index:2147483647;background-color:rgba(0,0,0,.65);transition-duration:210ms;transition-property:background-color}.okanjo-modal-container.lt-ie9{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNiWAoAAK4AqL41IDIAAAAASUVORK5CYII=)}.okanjo-modal-container.okanjo-modal-fade-out{background-color:rgba(0,0,0,0)}.okanjo-modal-container.okanjo-modal-fade-out .okanjo-modal-window{opacity:0;transform:scale(.95,.95) translateY(50px)}.okanjo-modal-container.okanjo-modal-hidden{display:none!important}.okanjo-modal-container .okanjo-modal-window{position:relative;max-width:900px;width:90%;background:0 0;margin:56px auto 40px;opacity:1;transform:scale(1,1) translateY(0);transition-duration:210ms;transition-timing-function:cubic-bezier(0.13,0.025,0.15,1.15);transition-property:opacity}.okanjo-modal-container .okanjo-modal-window:after,.okanjo-modal-container .okanjo-modal-window:before{content:\" \";display:table}.okanjo-modal-container .okanjo-modal-window:after{clear:both}.okanjo-modal-container .okanjo-modal-window .okanjo-modal-header{padding-top:5px;padding-bottom:5px;border-bottom:1px solid #d7d7d7}.okanjo-modal-container .okanjo-modal-window .okanjo-modal-header img{height:50px;width:auto}.okanjo-modal-container .okanjo-modal-window-skin{width:auto;height:auto;box-shadow:0 10px 25px rgba(0,0,0,.5);position:absolute;background:#fff;border-radius:4px;top:0;bottom:0;left:0;right:0}.okanjo-modal-container .okanjo-modal-window-outer{position:absolute;top:15px;left:15px;bottom:15px;right:15px;vertical-align:top}.okanjo-modal-container .okanjo-modal-window-inner{position:relative;width:100%;height:100%;-webkit-overflow-scrolling:touch;overflow:auto}.okanjo-modal-container .okanjo-modal-window-inner iframe{height:100%;width:100%;margin-right:-15px}.okanjo-modal-container .okanjo-modal-close-button{color:#fff;cursor:pointer;position:absolute;right:0;top:-48px;text-align:right;font-size:40px;line-height:1em;overflow:visible;width:40px;height:40px}", {
    id: 'okanjo-modal'
  });
  okanjo.ui.engine.registerTemplate("okanjo.error", "<span class=okanjo-error>{{ message }}</span><img src=\"//cdn.okanjo.com/px/0.gif?n={{ now }}\"> {{#code}} <span class=okanjo-error-code>Reference: {{ code }}</span> {{/code}}", {
    css: ['okanjo.core']
  });
})(window);

(function (window) {
  var okanjo = window.okanjo;
  okanjo.ui.engine.registerCss("okanjo.slab", ".okanjo-expansion-root{position:relative}.okanjo-expansion-root iframe.okanjo-ad-in-unit{position:absolute;top:0;left:0;right:0;bottom:0;z-index:1}.okanjo-align-start{display:flex;align-items:flex-start}.okanjo-align-end{display:flex;align-items:flex-end}.okanjo-align-center{display:flex;align-items:center}.okanjo-align-baseline{display:flex;align-items:baseline}.okanjo-align-stretch{display:flex;align-items:stretch}.okanjo-justify-start{display:flex;justify-content:flex-start}.okanjo-justify-end{display:flex;justify-content:flex-end}.okanjo-justify-center{display:flex;justify-content:center}.okanjo-justify-between{display:flex;justify-content:space-between}.okanjo-justify-around{display:flex;justify-content:space-around}.okanjo-justify-evenly{display:flex;justify-content:space-evenly}.okanjo-block2.okanjo-slab img.okanjo-fit{height:100%;width:100%;object-fit:cover}.okanjo-block2.okanjo-slab.okanjo-cta-style-none .okanjo-resource-button-container{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.okanjo-block2.okanjo-slab.okanjo-cta-style-none .okanjo-resource.list .okanjo-resource-title-container{height:78px}.okanjo-block2.okanjo-slab.okanjo-cta-style-button .okanjo-resource-title-container{height:40px}.okanjo-block2.okanjo-slab.okanjo-cta-style-button .okanjo-resource.list .okanjo-resource-title-container{height:50px}.okanjo-block2.okanjo-slab .okanjo-resource{width:298px}.okanjo-block2.okanjo-slab .okanjo-resource-publisher-container,.okanjo-block2.okanjo-slab .okanjo-resource-seller-container{max-width:200px}.okanjo-block2.okanjo-slab .okanjo-resource-image-container{height:155px}.okanjo-block2.okanjo-slab .okanjo-resource-title-container{height:58px;font-size:16px;line-height:19px}.okanjo-block2.okanjo-slab .okanjo-resource.list .okanjo-resource-title-container{font-size:14px;height:60px}.okanjo-block2.okanjo-slab.theme-newsprint .okanjo-resource-title-container{font:16px/19px Georgia,serif}.okanjo-block2.okanjo-slab.theme-newsprint .okanjo-resource.list .okanjo-resource-title-container{font-size:15px}.okanjo-block2.okanjo-slab.responsive .okanjo-resource-list{display:flex;flex-wrap:wrap;justify-content:center}.okanjo-block2.okanjo-slab.responsive .okanjo-resource{width:inherit;flex-grow:1;flex-shrink:0;flex-basis:33.3333%;flex-basis:200px;display:flex;align-items:center;justify-content:center}.okanjo-block2.okanjo-slab.responsive .okanjo-resource.list{flex-basis:33.3333%;flex-basis:250px}.okanjo-block2.okanjo-slab.responsive .okanjo-resource.list a{width:100%}.okanjo-block2.okanjo-slab.responsive .okanjo-resource:last-child{margin:0 -1px -1px 0}.okanjo-block2.okanjo-slab.medium_rectangle .okanjo-resource,.okanjo-block2.okanjo-slab.medium_rectangle .okanjo-resource:first-child{width:298px;height:248px}.okanjo-block2.okanjo-slab.medium_rectangle .okanjo-resource .okanjo-resource-title-container{height:40px;margin-bottom:4px}.okanjo-block2.okanjo-slab.medium_rectangle .okanjo-resource .okanjo-resource-image-container{height:155px}.okanjo-block2.okanjo-slab.medium_rectangle.okanjo-cta-style-none .okanjo-resource-title-container{height:60px}.okanjo-block2.okanjo-slab.leaderboard .okanjo-resource .okanjo-resource-title-container{font-size:13px;line-height:15px;height:48px;margin-top:1px;margin-bottom:1px}.okanjo-block2.okanjo-slab.leaderboard.okanjo-cta-style-none .okanjo-resource.list .okanjo-resource-title-container{height:62px}.okanjo-block2.okanjo-slab.leaderboard.theme-newsprint .okanjo-resource .okanjo-resource-title-container{font:bold 13px/15px Georgia,serif}.okanjo-block2.okanjo-slab.large_mobile_banner .okanjo-resource .okanjo-resource-title-container{height:48px;line-height:16px}.okanjo-block2.okanjo-slab.large_mobile_banner.okanjo-cta-style-none .okanjo-resource.list .okanjo-resource-title-container{height:69px}.okanjo-block2.okanjo-slab.half_page .okanjo-resource,.okanjo-block2.okanjo-slab.half_page .okanjo-resource:nth-last-child(n+2){width:298px;height:298px}.okanjo-block2.okanjo-slab.half_page .okanjo-resource:first-child{height:299px}.okanjo-block2.okanjo-slab.half_page .okanjo-resource .okanjo-resource-image-container{width:100%;height:180px}.okanjo-block2.okanjo-slab.half_page .okanjo-resource .okanjo-resource-title-container{margin-bottom:6px;height:60px}.okanjo-block2.okanjo-slab.half_page.okanjo-cta-style-button .okanjo-resource-title-container{height:42px;margin-bottom:8px}.okanjo-block2.okanjo-slab.half_page.okanjo-cta-style-none .okanjo-resource-title-container{height:77px}.okanjo-block2.okanjo-slab.half_page.dense .okanjo-resource{width:298px;height:198px}.okanjo-block2.okanjo-slab.half_page.dense .okanjo-resource:nth-last-child(n+2){width:298px;height:199px}.okanjo-block2.okanjo-slab.half_page.dense .okanjo-resource:first-child{height:199px}.okanjo-block2.okanjo-slab.half_page.dense .okanjo-resource .okanjo-resource-button-container{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.okanjo-block2.okanjo-slab.half_page.dense .okanjo-resource .okanjo-resource-image-container{width:100%;height:130px}.okanjo-block2.okanjo-slab.half_page.dense .okanjo-resource .okanjo-resource-title-container{height:42px;margin-top:1px;font-size:15px;line-height:16px}.okanjo-block2.okanjo-slab.billboard .okanjo-resource,.okanjo-block2.okanjo-slab.billboard .okanjo-resource:first-child{width:322px;height:248px}.okanjo-block2.okanjo-slab.billboard .okanjo-resource .okanjo-resource-title-container{height:40px;margin-bottom:4px}.okanjo-block2.okanjo-slab.billboard .okanjo-resource .okanjo-resource-image-container{height:155px}.okanjo-block2.okanjo-slab.billboard.okanjo-cta-style-none .okanjo-resource-title-container{height:60px}.okanjo-block2.okanjo-slab.auto .okanjo-resource.list .okanjo-resource-image-container{width:100px;height:100px}.okanjo-block2.okanjo-slab.auto .okanjo-resource.list .okanjo-resource-info-container{margin-left:111px;width:auto}", {
    id: 'okanjo-slab'
  });
  okanjo.ui.engine.registerTemplate("container.slab", okanjo.ui.__block2, function (model) {
    model.config = this.config;
    model.instanceId = this.instanceId;
    model.blockClasses = ['okanjo-slab'];
    model.fitImage = 'okanjo-fit'; // Enforce format restrictions

    this._enforceSlabLayoutOptions();

    return model;
  }, {
    css: ['okanjo.slab', 'okanjo.block2', 'okanjo.modal']
  });
})(window);

(function (window) {
  var okanjo = window.okanjo;
  okanjo.ui.engine.registerCss("products.block2", "", {
    id: 'okanjo-product-block2'
  });
  okanjo.ui.__product_block2 = "{{#resources}}<div class=\"okanjo-resource okanjo-product {{#config}}{{ template_layout }}{{/config}}\" itemscope itemtype=https://schema.org/Product><a href=\"//{{ okanjoMetricUrl }}/metrics/pr/int?m[bot]=true&id={{ id }}&{{ metricParams }}&n={{ now }}&u={{ _escaped_buy_url }}\" data-id=\"{{ id }}\" data-index=\"{{ _index }}\" data-segment=\"{{ _segmentIndex }}\" data-type=product data-backfill=\"{{ backfill }}\" target=_blank itemprop=url title=\"Buy now: {{ name }}\"><div class=okanjo-resource-image-container><img alt=\"\" class=\"okanjo-resource-image {{ fitImage }}\" src=\"{{ _image_url }}\" title=\"{{ name }}\" itemprop=image data-id=\"{{ id }}\"></div><div class=okanjo-resource-info-container><div class=okanjo-resource-seller-container itemprop=seller itemscope itemtype=https://schema.org/Organization><span class=okanjo-resource-seller itemprop=name title=\"{{ store_name }}\">{{ store_name }}{{^store_name}}&nbsp;{{/store_name}}</span></div><div class=okanjo-resource-title-container><span class=okanjo-resource-title itemprop=name>{{ name }}</span></div><div><div class=\"okanjo-resource-price-container {{price_classes}}\"><span content=\"{{ currency }}\">$</span><span class=okanjo-resource-price>{{ _price_formatted }}</span></div><div class=okanjo-resource-button-container><div class=\"okanjo-resource-buy-button {{button_classes}}\"><span>{{ meta.cta_text }}{{^meta.cta_text}}{{#config}}{{ template_cta_text }}{{^template_cta_text}}Shop Now{{/template_cta_text}}{{/config}}{{/meta.cta_text}}</span></div><meta property=url itemprop=url content=\"//{{ okanjoMetricUrl }}/metrics/pr/int?m[bot]=true&m[microdata]=true&id={{ id }}&{{ metricParams }}&n={{ now }}&u={{ _escaped_buy_url }}\"></div></div><div class=\"okanjo-resource-meta okanjo-visually-hidden\">{{#impression_url}}<img src=\"{{ impression_url }}\" alt=\"\">{{/impression_url}} {{#upc}}<span itemprop=productID>upc:{{ upc }}</span>{{/upc}} {{#manufacturer}}<span itemprop=manufacturer>{{ manufacturer }}</span>{{/manufacturer}} <img alt=\"\" src=\"//cdn.okanjo.com/px/1.gif?n={{ now }}\"></div></div></a></div>{{/resources}}";
  okanjo.ui.engine.registerTemplate("products.block2", okanjo.ui.__product_block2, function (model) {
    // Attach placement properties
    model.config = this.config;
    model.instanceId = this.instanceId;
    model.metricChannel = this._metricBase.ch;
    model.metricContext = this._metricBase.cx;
    model.metricParams = okanjo.net.request.stringify(this._metricBase); // Enforce format restrictions

    this._enforceLayoutOptions(); // Add branding if necessary


    this._registerCustomBranding('.okanjo-product', 'buy-button');

    return model;
  }, {
    css: [
    /*'okanjo.core',*/
    'products.block2', 'okanjo.block2', 'okanjo.modal']
  });
})(window);

(function (window) {
  var okanjo = window.okanjo;
  okanjo.ui.engine.registerCss("products.slab", ".okanjo-expansion-root{position:relative}.okanjo-expansion-root iframe.okanjo-ad-in-unit{position:absolute;top:0;left:0;right:0;bottom:0;z-index:1}.okanjo-align-start{display:flex;align-items:flex-start}.okanjo-align-end{display:flex;align-items:flex-end}.okanjo-align-center{display:flex;align-items:center}.okanjo-align-baseline{display:flex;align-items:baseline}.okanjo-align-stretch{display:flex;align-items:stretch}.okanjo-justify-start{display:flex;justify-content:flex-start}.okanjo-justify-end{display:flex;justify-content:flex-end}.okanjo-justify-center{display:flex;justify-content:center}.okanjo-justify-between{display:flex;justify-content:space-between}.okanjo-justify-around{display:flex;justify-content:space-around}.okanjo-justify-evenly{display:flex;justify-content:space-evenly}.okanjo-block2.okanjo-slab .okanjo-resource.okanjo-product .okanjo-resource-title-container{height:40px;margin-bottom:2px}.okanjo-block2.okanjo-slab .okanjo-resource.okanjo-product.list .okanjo-resource-title-container{font-size:14px;height:40px}.okanjo-block2.okanjo-slab.okanjo-cta-style-button .okanjo-resource.okanjo-product.list .okanjo-resource-title-container{height:30px;font-size:12px;line-height:14px}.okanjo-block2.okanjo-slab.okanjo-cta-style-button.theme-newsprint .okanjo-resource.okanjo-product.list .okanjo-resource-title-container{font-size:13px}.okanjo-block2.okanjo-slab.okanjo-cta-style-none .okanjo-resource.okanjo-product.list .okanjo-resource-title-container{height:60px}.okanjo-block2.okanjo-slab.medium_rectangle .okanjo-resource.okanjo-product .okanjo-resource-title-container{margin-bottom:4px;margin-top:2px}.okanjo-block2.okanjo-slab.medium_rectangle .okanjo-resource.okanjo-product .okanjo-resource-price-container{display:inline-block}.okanjo-block2.okanjo-slab.medium_rectangle .okanjo-resource.okanjo-product .okanjo-resource-button-container{display:inline-block;margin-left:10px;font-size:15px;line-height:1}.okanjo-block2.okanjo-slab.medium_rectangle .okanjo-resource.okanjo-product .okanjo-resource-button-container .okanjo-resource-buy-button{font-size:14px;overflow:inherit}.okanjo-block2.okanjo-slab.medium_rectangle.okanjo-cta-style-none .okanjo-resource.okanjo-product .okanjo-resource-title-container{height:40px}.okanjo-block2.okanjo-slab.leaderboard .okanjo-resource.okanjo-product .okanjo-resource-title-container{margin-bottom:0;height:32px;font-size:14px}.okanjo-block2.okanjo-slab.leaderboard.okanjo-cta-style-none .okanjo-resource.okanjo-product.list .okanjo-resource-title-container{height:47px}.okanjo-block2.okanjo-slab.large_mobile_banner .okanjo-resource.okanjo-product .okanjo-resource-title-container{height:34px;font-size:14px;line-height:16px;margin-bottom:2px}.okanjo-block2.okanjo-slab.large_mobile_banner.okanjo-cta-style-none .okanjo-resource.okanjo-product.list .okanjo-resource-title-container{height:50px}.okanjo-block2.okanjo-slab.half_page .okanjo-resource.okanjo-product .okanjo-resource-title-container{height:40px}.okanjo-block2.okanjo-slab.half_page.okanjo-cta-style-button .okanjo-resource.okanjo-product .okanjo-resource-title-container{height:34px;margin-bottom:0;line-height:15px;font-size:15px}.okanjo-block2.okanjo-slab.half_page.okanjo-cta-style-none .okanjo-resource.okanjo-product .okanjo-resource-title-container{height:60px}.okanjo-block2.okanjo-slab.half_page.dense .okanjo-resource.okanjo-product .okanjo-resource-title-container{height:33px;font-size:15px;line-height:15px}.okanjo-block2.okanjo-slab.half_page.dense .okanjo-resource.okanjo-product .okanjo-resource-button-container,.okanjo-block2.okanjo-slab.half_page.dense .okanjo-resource.okanjo-product .okanjo-resource-price-container{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.okanjo-block2.okanjo-slab.billboard .okanjo-resource.okanjo-product .okanjo-resource-title-container{margin-bottom:4px;margin-top:2px}.okanjo-block2.okanjo-slab.billboard .okanjo-resource.okanjo-product .okanjo-resource-price-container{display:inline-block}.okanjo-block2.okanjo-slab.billboard .okanjo-resource.okanjo-product .okanjo-resource-button-container{display:inline-block;margin-left:10px;font-size:15px;line-height:1}.okanjo-block2.okanjo-slab.billboard .okanjo-resource.okanjo-product .okanjo-resource-button-container .okanjo-resource-buy-button{font-size:14px;overflow:inherit}.okanjo-block2.okanjo-slab.billboard.okanjo-cta-style-none .okanjo-resource.okanjo-product .okanjo-resource-title-container{height:40px}.okanjo-block2.okanjo-slab.auto .okanjo-resource.okanjo-product.list .okanjo-resource-title-container{height:auto;margin-bottom:2px;line-height:20px}.okanjo-block2.okanjo-slab.auto .okanjo-resource.okanjo-product.list .okanjo-resource-price-container{margin-bottom:0}.okanjo-block2.okanjo-slab.auto.okanjo-cta-style-button .okanjo-resource.okanjo-product .okanjo-resource-price-container{margin-bottom:3px}", {
    id: 'okanjo-product-slab'
  }); // Reuses block2 markup layout, extended css

  okanjo.ui.engine.registerTemplate("products.slab", okanjo.ui.__product_block2, function (model) {
    model.blockClasses = ['okanjo-slab'];
    model.config = this.config;
    model.instanceId = this.instanceId;
    model.metricChannel = this._metricBase.ch;
    model.metricContext = this._metricBase.cx;
    model.metricParams = okanjo.net.request.stringify(this._metricBase);
    model.fitImage = 'okanjo-fit'; // Enforce format restrictions
    // this._enforceLayoutOptions();

    this._enforceSlabLayoutOptions(); // Add branding if necessary


    this._registerCustomBranding('.okanjo-product', 'button');

    return model;
  }, {
    css: ['products.slab', 'okanjo.slab', 'okanjo.block2']
  });
})(window);})(okanjo);