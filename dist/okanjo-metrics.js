/*! okanjo-metrics.js v1.0.0 | (c) 2013 Okanjo Partners Inc | https://okanjo.com/ */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.okanjo = factory();
  }
}(this, function() {
"use strict";

/* exported okanjo */

//noinspection ThisExpressionReferencesGlobalObjectJS
/**
 * Okanjo widget framework namespace
 * @global okanjo
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
        version: "1.0.0",

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

            Console.error("[Okanjo v" + okanjo.version + "]: " + err.stack);
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

            Console.warn("[Okanjo v" + okanjo.version + "]: " + err.stack);
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
            ads: '/ads',
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
                    route = route.replace(":" + key, params[key] + "");
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
        } else if ((typeof mixed === "undefined" ? "undefined" : _typeof(mixed)) === "object" && mixed !== null) {
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
                var pos = okanjo.ui.getScrollPosition();

                /* istanbul ignore else: jsdom doesn't mock this */
                if (!document.body.contains(element)) {
                    okanjo.report(err, element);
                }
                return {
                    x1: rect.left + pos.x,
                    y1: rect.top + pos.y,
                    x2: rect.right + pos.x,
                    y2: rect.bottom + pos.y
                };
            } catch (e) {
                okanjo.report(err, { exception: e, element: element });
                return {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 0
                };
            }
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
            return keyPrefix + "[" + encode(key) + "]";
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
            } else if ((typeof value === "undefined" ? "undefined" : _typeof(value)) === "object" && value !== null) {
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
            var cookieValue = encodeURI(value) + ";" + expires + path;
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
            key: "_getStoredQueue",
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
            key: "trackEvent",
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
            key: "trackPageView",
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
            key: "_push",
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
            key: "_processQueue",
            value: function _processQueue() {
                var _this2 = this;

                // If the queue is not already being processed, and there's stuff to process, continue sending them
                if (!this._processTimeout && this._queue.length > 0) {
                    this._processTimeout = setTimeout(function () {

                        // Pull the items we're going to batch out of the queue
                        var items = _this2._queue.splice(0, 255);
                        _this2._saveQueue(false);

                        // Track the item
                        _this2._batchSend(items, function (err, res) {
                            // TODO: If there was an error, consider splicing the batch back into the queue

                            // Update / Set the metric sid on the publisher
                            /* istanbul ignore else: server barks */
                            if (res && res.data && res.data.sid) _this2._updateSid(res.data.sid);

                            // When this batch is done being tracked, iterate to the next metric then fire it's callback if set
                            _this2._processTimeout = null;
                            _this2._processQueue();

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
            key: "_batchSend",
            value: function _batchSend(items, callback) {
                var _this3 = this;

                // Normalize event data
                var events = items.map(function (item) {
                    _this3._normalizeEvent(item.event);
                    return item.event;
                });

                var payload = {
                    events: events
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
            key: "_normalizeEvent",
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
                event.m = okanjo.util.flatten(event.m);

                // Set page source reference
                if (document.referrer) {
                    event.ref = document.referrer;
                }
            }

            /**
             * Updates the stored session identifier
             * @param sid
             * @private
             */

        }, {
            key: "_updateSid",
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
            key: "create",


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

            //noinspection JSUnusedGlobalSymbols
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
            }

            //noinspection JSUnusedGlobalSymbols
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
            }

            //noinspection JSUnusedGlobalSymbols
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
            key: "create",
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
            _classCallCheck(this, MetricEvent);

            // Merge the data and other data sets into this object
            data = data || {};
            // others = others || []; // the only way to create this right now is via .create ^
            Object.assign.apply(Object, [this, data].concat(others));
        }

        /**
         * Sets event parameter key-values
         * @param data
         */


        _createClass(MetricEvent, [{
            key: "data",
            value: function data(_data) {
                Object.assign(this, _data);
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

            //noinspection JSUnusedGlobalSymbols
            /**
             * Adds meta data values to the event
             * @param args
             * @return {MetricEvent}
             */

        }, {
            key: "meta",
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
                okanjo.metrics.trackEvent(this, callback);
                // DONT RETURN - BREAK THE CHAIN HERE
            }

            /**
             * Gets the single-metric tracking url for this event
             * @return {string}
             */

        }, {
            key: "toUrl",
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
/* jshint ignore:start */

(function () {

    /*! onDomReady.js 1.4.0 (c) 2013 Tubal Martin - MIT license | Wrapped in UMD by Okanjo */
    (function (root, factory) {
        if (typeof define === 'function' && define.amd) {
            define([], factory);
        } else if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object') {
            module.exports = factory();
        } else {
            root.onDomReady = factory();
        }
    })(this, function () {

        'use strict';

        var win = window,
            doc = win.document,
            docElem = doc.documentElement,
            LOAD = "load",
            FALSE = false,
            ONLOAD = "on" + LOAD,
            COMPLETE = "complete",
            READYSTATE = "readyState",
            ATTACHEVENT = "attachEvent",
            DETACHEVENT = "detachEvent",
            ADDEVENTLISTENER = "addEventListener",
            DOMCONTENTLOADED = "DOMContentLoaded",
            ONREADYSTATECHANGE = "onreadystatechange",
            REMOVEEVENTLISTENER = "removeEventListener",


        // W3C Event model
        w3c = ADDEVENTLISTENER in doc,
            top = FALSE,


        // isReady: Is the DOM ready to be used? Set to true once it occurs.
        isReady = FALSE,


        // Callbacks pending execution until DOM is ready
        callbacks = [];

        // Handle when the DOM is ready
        function ready(fn) {
            if (!isReady) {

                // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
                if (!doc.body) {
                    return defer(ready);
                }

                // Remember that the DOM is ready
                isReady = true;

                // Execute all callbacks
                while (fn = callbacks.shift()) {
                    defer(fn);
                }
            }
        }

        // The ready event handler
        function completed(event) {
            // readyState === "complete" is good enough for us to call the dom ready in oldIE
            if (w3c || event.type === LOAD || doc[READYSTATE] === COMPLETE) {
                detach();
                ready();
            }
        }

        // Clean-up method for dom ready events
        function detach() {
            if (w3c) {
                doc[REMOVEEVENTLISTENER](DOMCONTENTLOADED, completed, FALSE);
                win[REMOVEEVENTLISTENER](LOAD, completed, FALSE);
            } else {
                doc[DETACHEVENT](ONREADYSTATECHANGE, completed);
                win[DETACHEVENT](ONLOAD, completed);
            }
        }

        // Defers a function, scheduling it to run after the current call stack has cleared.
        function defer(fn, wait) {
            // Allow 0 to be passed
            setTimeout(fn, +wait >= 0 ? wait : 1);
        }

        // Attach the listeners:

        // Catch cases where onDomReady is called after the browser event has already occurred.
        // we once tried to use readyState "interactive" here, but it caused issues like the one
        // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
        if (doc[READYSTATE] === COMPLETE) {
            // Handle it asynchronously to allow scripts the opportunity to delay ready
            defer(ready);

            // Standards-based browsers support DOMContentLoaded
        } else if (w3c) {
            // Use the handy event callback
            doc[ADDEVENTLISTENER](DOMCONTENTLOADED, completed, FALSE);

            // A fallback to window.onload, that will always work
            win[ADDEVENTLISTENER](LOAD, completed, FALSE);

            // If IE event model is used
        } else {
            // Ensure firing before onload, maybe late but safe also for iframes
            doc[ATTACHEVENT](ONREADYSTATECHANGE, completed);

            // A fallback to window.onload, that will always work
            win[ATTACHEVENT](ONLOAD, completed);

            // If IE and not a frame
            // continually check to see if the document is ready
            try {
                top = win.frameElement == null && docElem;
            } catch (e) {}

            if (top && top.doScroll) {
                (function doScrollCheck() {
                    if (!isReady) {
                        try {
                            // Use the trick by Diego Perini
                            // http://javascript.nwbox.com/IEContentLoaded/
                            top.doScroll("left");
                        } catch (e) {
                            return defer(doScrollCheck, 50);
                        }

                        // detach all dom ready events
                        detach();

                        // and execute any waiting functions
                        ready();
                    }
                })();
            }
        }

        function onDomReady(fn) {
            // If DOM is ready, execute the function (async), otherwise wait
            isReady ? defer(fn) : callbacks.push(fn);
        }

        // Add version
        onDomReady.version = "1.4.0";
        // Add method to check if DOM is ready
        onDomReady.isReady = function () {
            return isReady;
        };

        return onDomReady;
    });
}).apply(okanjo.lib);

/* jshint ignore:end */
return okanjo;
}));
