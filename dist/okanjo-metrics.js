/*! okanjo-metrics.js v2.4.0 | (c) 2013 Okanjo Partners Inc | https://okanjo.com/ */
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.okanjo = factory();
  }
}(this, function() {
"use strict";

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
    version: "2.4.0",

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
     * @return {number}
     */
    getPercentageInViewport: function getPercentageInViewport(element) {
      var e = okanjo.ui.getElementPosition(element),
          s = okanjo.ui.getScrollPosition(),
          v = okanjo.ui.getViewportSize(); // If there was a problem getting the element position, fail fast

      if (e.err) return 0; // Get intersection rectangle

      var _okanjo$ui$_getInters = okanjo.ui._getIntersection(e, s, v),
          intersectionArea = _okanjo$ui$_getInters.intersectionArea,
          elementArea = _okanjo$ui$_getInters.elementArea; // Don't let it return NaN

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
        var _this = this;

        if (delay) {
          if (this._saveQueueTimeout) clearTimeout(this._saveQueueTimeout);
          this._saveQueueTimeout = setTimeout(function () {
            _this._saveQueue(false);

            _this._saveQueueTimeout = null;
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
        var _this2 = this;

        // If the queue is not already being processed, and there's stuff to process, continue sending them
        if (!this._processTimeout && this._queue.length > 0) {
          this._processTimeout = setTimeout(function () {
            // Pull the items we're going to batch out of the queue
            var items = _this2._queue.splice(0, 255);

            _this2._saveQueue(false); // Track the item


            _this2._batchSend(items, function (err, res) {
              // TODO: If there was an error, consider splicing the batch back into the queue
              // Update / Set the metric sid on the publisher

              /* istanbul ignore else: server barks */
              if (res && res.data && res.data.sid) _this2._updateSid(res.data.sid); // When this batch is done being tracked, iterate to the next metric then fire it's callback if set

              _this2._processTimeout = null;

              _this2._processQueue(); // Fire the event callbacks if there are any


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
        var _this3 = this;

        // Normalize event data
        var events = items.map(function (item) {
          _this3._normalizeEvent(item.event); // Strip duplicated data from event batch


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
        // Deleting properties on the meta object could be very destructive

        event.m = Object.assign({}, event.m); // event.m should be flat
        // Strip meta keys that should be excluded

        Object.keys(Metrics.Meta.exclude).forEach(function (key) {
          return delete event.m[key];
        }); // Set referral channel / context

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

  var MetricEvent = /*#__PURE__*/function () {
    function MetricEvent(data, others) {
      var _this4 = this;

      _classCallCheck(this, MetricEvent);

      // Merge the data and other data sets into this object
      data = data || {};
      this.data(data);
      /* istanbul ignore else: metrics.create is the only way to create this right now */

      if (Array.isArray(others)) {
        others.forEach(function (data) {
          _this4.data(data);
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
})(window, document);
return okanjo;
}));
